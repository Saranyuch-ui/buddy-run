import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Header from "../components/Header";

function extractAmountFromText(text) {
  // หาตัวเลขรูปแบบ "1,234.00" หรือ "1234.00" ในข้อความที่ OCR อ่านได้
  const matches = text.match(/\d{1,3}(,\d{3})*\.\d{2}/g);

  if (!matches || matches.length === 0) return null;

  // เลือกตัวเลขที่มากที่สุด (ยอดเงินมักเป็นตัวเลขเด่นที่สุดในสลิป)
  const numbers = matches.map((m) => Number(m.replace(/,/g, "")));
  return Math.max(...numbers);
}

function Payment({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [amount, setAmount] = useState("");
  const [amountLocked, setAmountLocked] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
const [slipPreview, setSlipPreview] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetch(`/api/registrations?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRegistrations(data.registrations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoggedIn, currentUser]);

  if (!isLoggedIn) {
    return (
      <>
        <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />
        <div className="coming-soon">
          <h2>กรุณาเข้าสู่ระบบ</h2>
          <p>ต้องเข้าสู่ระบบก่อนเพื่อชำระเงิน</p>
          <button className="auth-submit-btn" onClick={() => onNavigate("login")}>
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </>
    );
  }

  const unpaidRegs = registrations.filter((r) => r.status === "confirmed");

  const startPay = (reg) => {
    setPayingId(reg.id);
    setAmount("");
    setAmountLocked(false);
    setSlipFile(null);
    setSlipPreview(null);
    setOcrMessage("");
  };

  const handleFileChange = async (e, reg) => {
    const file = e.target.files[0];
    if (!file) return;

    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setAmount("");
    setAmountLocked(false);
    setOcrMessage("");
    setOcrProcessing(true);

    try {
      const result = await Tesseract.recognize(file, "eng");
      const detectedAmount = extractAmountFromText(result.data.text);

      if (detectedAmount && detectedAmount >= reg.price) {
        setAmount(detectedAmount.toString());
        setAmountLocked(true);
        setOcrMessage(`✅ อ่านยอดจากสลิปได้: ${detectedAmount.toLocaleString()} บาท`);
      } else if (detectedAmount) {
        // อ่านตัวเลขได้ แต่ยอดต่ำกว่าราคาแพ็กเกจ - ยังล็อกเพื่อความถูกต้อง แต่แจ้งเตือน
        setAmount(detectedAmount.toString());
        setAmountLocked(true);
        setOcrMessage(
          `⚠️ อ่านยอดได้ ${detectedAmount.toLocaleString()} บาท ซึ่งต่ำกว่ายอดที่ต้องชำระ (${reg.price.toLocaleString()} บาท)`
        );
      } else {
        // อ่านไม่ได้เลย - ไม่ล็อกฟิลด์ ให้ผู้ใช้กรอกเองแทน
        setAmount("");
        setAmountLocked(false);
        setOcrMessage(
          "⚠️ ระบบไม่สามารถอ่านยอดจากสลิปได้อัตโนมัติ กรุณากรอกจำนวนเงินด้วยตนเอง"
        );
      }
    } catch (err) {
      setAmountLocked(false);
      setOcrMessage("⚠️ เกิดข้อผิดพลาดขณะอ่านสลิป กรุณากรอกจำนวนเงินด้วยตนเอง");
    } finally {
      setOcrProcessing(false);
    }
  };

  const handlePay = async (reg) => {
    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum < reg.price) {
      alert(`ยอดชำระต้องไม่ต่ำกว่า ${reg.price.toLocaleString()} บาท`);
      return;
    }

    if (!slipFile) {
      alert("กรุณาแนบสลิปการโอนเงิน");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("registrationId", reg.id);
      formData.append("amount", amountNum);
      formData.append("slip", slipFile);

      const res = await fetch("/api/registrations/pay", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ชำระเงินไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      setRegistrations(
        registrations.map((r) =>
          r.id === reg.id ? { ...r, status: "paid", paid_amount: amountNum } : r
        )
      );
      setPayingId(null);
      setSlipFile(null);
      setAmountLocked(false);
      alert("ชำระเงินสำเร็จ! สถานะอัปเดตเป็น 'ชำระเรียบร้อย' แล้ว");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="payment-page">
        <h2 className="payment-title">ชำระเงินกิจกรรม</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : unpaidRegs.length === 0 ? (
          <p className="empty-text">ไม่มีกิจกรรมที่รอชำระเงิน</p>
        ) : (
          <div className="payment-list">
            {unpaidRegs.map((reg) => (
              <div key={reg.id} className="payment-item">
                <div className="payment-info">
                  <h4>{reg.event_title}</h4>
                  <p>{reg.package_name}</p>
                  <p className="payment-price">
                    ยอดที่ต้องชำระ: {reg.price.toLocaleString()} บาท
                  </p>
                </div>

                {payingId === reg.id ? (
                  <div className="payment-form">
                    <label>แนบสลิปการโอนเงิน</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange(e, reg)}
                    />

                    {ocrProcessing && (
                      <p className="ocr-status">🔍 กำลังอ่านยอดจากสลิป...</p>
                    )}

                    {ocrMessage && !ocrProcessing && (
                      <p className="ocr-status">{ocrMessage}</p>
                    )}

                    <label>จำนวนเงินที่โอน (บาท)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={reg.price}
                      disabled={amountLocked}
                      placeholder="แนบสลิปเพื่อให้ระบบอ่านยอดอัตโนมัติ"
                    />

                    <div className="payment-actions">
                      <button
                        className="auth-submit-btn"
                        onClick={() => handlePay(reg)}
                        disabled={submitting || ocrProcessing}
                      >
                        {submitting ? "กำลังตรวจสอบ..." : "ยืนยันการชำระเงิน"}
                      </button>
                      <button
                        className="auth-secondary-btn"
                        onClick={() => setPayingId(null)}
                        disabled={submitting}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="pay-btn" onClick={() => startPay(reg)}>
                    ชำระเงิน
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Payment;
