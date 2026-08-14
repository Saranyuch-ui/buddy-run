import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Header from "../components/Header";

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

function ShopPayment({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [orders, setOrders] = useState([]);
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

    fetch(`/api/orders?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
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

  const unpaidOrders = orders.filter((o) => o.status === "pending");

  const startPay = async (order) => {
    setPayingId(order.id);
    setOcrMessage("");

    if (order.slip_image) {
      setSlipPreview(order.slip_image);
      setAmount(order.paid_amount ? order.paid_amount.toString() : "");
      setAmountLocked(false);
      setOcrMessage("📎 นี่คือสลิปที่เคยแนบไว้ก่อนหน้านี้ สามารถส่งใหม่หรือแนบไฟล์อื่นแทนได้");

      try {
        const file = await dataUrlToFile(order.slip_image, "previous-slip.jpg");
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

  const handleFileChange = async (e, order) => {
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

      if (detectedAmount && detectedAmount >= order.total) {
        setAmount(detectedAmount.toString());
        setAmountLocked(true);
        setOcrMessage(`✅ อ่านยอดจากสลิปได้: ${detectedAmount.toLocaleString()} บาท`);
      } else if (detectedAmount) {
        setAmount(detectedAmount.toString());
        setAmountLocked(true);
        setOcrMessage(
          `⚠️ อ่านยอดได้ ${detectedAmount.toLocaleString()} บาท ซึ่งต่ำกว่ายอดที่ต้องชำระ (${order.total.toLocaleString()} บาท)`
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

  const handleCancelOrder = async (orderId) => {
    if (!confirm("ยืนยันยกเลิกคำสั่งซื้อนี้?")) return;

    try {
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, orderId }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ยกเลิกไม่สำเร็จ");
        return;
      }

      setOrders(orders.filter((o) => o.id !== orderId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handlePay = async (order) => {
    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum < order.total) {
      alert(`ยอดชำระต้องไม่ต่ำกว่า ${order.total.toLocaleString()} บาท`);
      return;
    }

    if (!slipFile) {
      alert("กรุณาแนบสลิปการโอนเงิน");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("amount", amountNum);
      formData.append("slip", slipFile);
      formData.append("verifiedByOcr", amountLocked ? "true" : "false");

      const res = await fetch("/api/orders/pay", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ชำระเงินไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      setOrders(
        orders.map((o) =>
          o.id === order.id ? { ...o, status: data.status, paid_amount: amountNum } : o
        )
      );
      setPayingId(null);
      setSlipFile(null);
      setSlipPreview(null);
      setAmountLocked(false);
      alert("ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว รอการตรวจสอบและอนุมัติ");
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
        <h2 className="payment-title">ชำระเงินร้านค้า</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : unpaidOrders.length === 0 ? (
          <p className="empty-text">ไม่มีคำสั่งซื้อที่รอชำระเงิน</p>
        ) : (
          <div className="payment-list">
            {unpaidOrders.map((order) => (
              <div key={order.id} className="payment-item">
                <div className="payment-info">
                  <h4>{order.product_name}</h4>
                  <p>ไซส์ {order.size || "-"} — จำนวน {order.quantity} ชิ้น</p>
                  <p className="payment-price">
                    ยอดที่ต้องชำระ: {order.total.toLocaleString()} บาท
                  </p>
                  {payingId !== order.id && (
                    <button
                      className="cancel-order-btn"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      ยกเลิกคำสั่งซื้อ
                    </button>
                  )}
                </div>

                {payingId === order.id ? (
                  <div className="payment-form">
                    <label>แนบสลิปการโอนเงิน</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange(e, order)}
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
                      min={order.total}
                      disabled={amountLocked}
                      placeholder="แนบสลิปเพื่อให้ระบบอ่านยอดอัตโนมัติ"
                    />

                    <div className="payment-actions">
                      <button
                        className="auth-submit-btn"
                        onClick={() => handlePay(order)}
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
                  <button className="pay-btn" onClick={() => startPay(order)}>
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

export default ShopPayment;
