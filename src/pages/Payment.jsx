import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Header from "../components/Header";
import AddressPickerModal from "../components/AddressPickerModal";

function extractAmountFromText(text) {
  const matches = text.match(/\d{1,3}(,\d{3})*\.\d{2}/g);
  if (!matches || matches.length === 0) return null;
  const numbers = matches.map((m) => Number(m.replace(/,/g, "")));
  return Math.max(...numbers);
}

async function dataUrlToFile(dataUrl, filename) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
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
  const [pickerRegId, setPickerRegId] = useState(null);
  const [updatingAddress, setUpdatingAddress] = useState(false);

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

    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" (UTC) — ให้ตรงกับ date('now') ฝั่ง worker
  const unpaidRegs = registrations.filter(
    (r) =>
      r.status === "confirmed" &&
      (!r.reg_end_date || r.reg_end_date.slice(0, 10) >= todayStr)
  );

  const startPay = async (reg) => {
    setPayingId(reg.id);
    setOcrMessage("");

    if (reg.slip_image) {
      // มีสลิปเดิมที่เคยแนบไว้ (ถูกปฏิเสธมาก่อน) -> แนบกลับให้อัตโนมัติ
      setSlipPreview(reg.slip_image);
      setAmount(reg.paid_amount ? reg.paid_amount.toString() : "");
      setAmountLocked(false);
      setOcrMessage("📎 นี่คือสลิปที่เคยแนบไว้ก่อนหน้านี้ สามารถส่งใหม่หรือแนบไฟล์อื่นแทนได้");

      try {
        const file = await dataUrlToFile(reg.slip_image, "previous-slip.jpg");
        setSlipFile(file);
      } catch (err) {
        setSlipFile(null);
      }
    } else {
      setAmount("");
      setAmountLocked(false);
      setSlipFile(null);
      setSlipPreview(null);
    }
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
        setAmount(detectedAmount.toString());
        setAmountLocked(true);
        setOcrMessage(
          `⚠️ อ่านยอดได้ ${detectedAmount.toLocaleString()} บาท ซึ่งต่ำกว่ายอดที่ต้องชำระ (${reg.price.toLocaleString()} บาท)`
        );
      } else {
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
    if (!reg.shipping_address) {
      alert("กรุณาเลือกที่อยู่จัดส่งก่อนชำระเงิน");
      return;
    }

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
      formData.append("verifiedByOcr", amountLocked ? "true" : "false");

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
          r.id === reg.id ? { ...r, status: data.status, paid_amount: amountNum } : r
        )
      );
      setPayingId(null);
      setSlipFile(null);
      setSlipPreview(null);
      setAmountLocked(false);

      if (data.status === "paid") {
        alert("ชำระเงินสำเร็จ! สถานะอัปเดตเป็น 'ชำระเรียบร้อย' แล้ว");
      } else {
        alert("ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว กรุณารอการอนุมัติจากเจ้าหน้าที่");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAddress = async (address) => {
    const registrationId = pickerRegId;
    setUpdatingAddress(true);

    try {
      const res = await fetch("/api/registrations/set-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          registrationId,
          addressId: address.id,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "อัปเดตที่อยู่จัดส่งไม่สำเร็จ");
        return;
      }

      setRegistrations(
        registrations.map((r) =>
          r.id === registrationId
            ? {
                ...r,
                shipping_name: address.recipient_name,
                shipping_phone: address.phone,
                shipping_address: [
                  address.house_no && `บ้านเลขที่ ${address.house_no}`,
                  address.moo && `หมู่ ${address.moo}`,
                  address.soi && `ซอย${address.soi}`,
                  address.road && `ถนน${address.road}`,
                  address.sub_district && `ต.${address.sub_district}`,
                  address.district && `อ.${address.district}`,
                  address.province && `จ.${address.province}`,
                  address.postal_code,
                ]
                  .filter(Boolean)
                  .join(" "),
              }
            : r
        )
      );
      setPickerRegId(null);
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUpdatingAddress(false);
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
                  <p className="ocr-status">
                    📦 ที่อยู่จัดส่ง:{" "}
                    {reg.shipping_address
                      ? `${reg.shipping_name} (${reg.shipping_phone}) — ${reg.shipping_address}`
                      : "ยังไม่ได้เลือกที่อยู่"}
                  </p>
                  <button
                    type="button"
                    className="auth-secondary-btn"
                    onClick={() => setPickerRegId(reg.id)}
                  >
                    📍 เลือกที่อยู่จัดส่ง
                  </button>
                </div>

                {payingId === reg.id ? (
                  <div className="payment-form">
                    <label>แนบสลิปการโอนเงิน</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange(e, reg)}
                    />

                    {slipPreview && (
                      <img
                        src={slipPreview}
                        alt="ตัวอย่างสลิป"
                        className="slip-preview"
                      />
                    )}

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

                    {!reg.shipping_address && (
                      <p className="ocr-status" style={{ color: "#dc2626" }}>
                        ⚠️ กรุณาเลือกที่อยู่จัดส่งก่อนชำระเงิน
                      </p>
                    )}

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

      {pickerRegId && (
        <AddressPickerModal
          currentUser={currentUser}
          onClose={() => setPickerRegId(null)}
          onSelect={handleSelectAddress}
          onNavigate={onNavigate}
        />
      )}
    </>
  );
}

export default Payment;
