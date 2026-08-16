import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Header from "../components/Header";

function extractAmountFromText(text) {
  const matches = text.match(/\d{1,3}(,\d{3})*\.\d{2}/g);
  if (!matches || matches.length === 0) return null;
  const numbers = matches.map((m) => Number(m.replace(/,/g, "")));
  return Math.max(...numbers);
}

function ShopPayment({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [amountLocked, setAmountLocked] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

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

  const unpaidOrders = orders.filter((o) => o.status === "pending");

  // ย้ายคำสั่งซื้อที่ยังไม่จ่ายกลับตะกร้าแบบเงียบๆ (ไม่มี confirm) - ใช้ตอนออกจากหน้านี้โดยไม่ได้จ่ายเงิน/ไม่ได้กดยกเลิกเอง
  const cancelAllSilently = async () => {
    if (!currentUser || paidSuccess || unpaidOrders.length === 0) return;

    try {
      await fetch("/api/orders/cancel-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });
    } catch (err) {
      // เงียบไว้ ไม่ต้องแจ้งเตือนผู้ใช้ตอนออกจากหน้า
    }
  };

  const handleLeaveNavigate = async (page) => {
    await cancelAllSilently();
    onNavigate(page);
  };

  const handleLeaveLogoClick = async () => {
    await cancelAllSilently();
    if (onLogoClick) onLogoClick();
  };

  const handleLeaveLogout = async () => {
    await cancelAllSilently();
    onLogout();
  };

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

  const grandTotal = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

  const handleFileChange = async (e) => {
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

      if (detectedAmount && detectedAmount >= grandTotal) {
        setAmount(detectedAmount.toString());
        setAmountLocked(true);
        setOcrMessage(`✅ อ่านยอดจากสลิปได้: ${detectedAmount.toLocaleString()} บาท`);
      } else if (detectedAmount) {
        setAmount(detectedAmount.toString());
        setAmountLocked(true);
        setOcrMessage(
          `⚠️ อ่านยอดได้ ${detectedAmount.toLocaleString()} บาท ซึ่งต่ำกว่ายอดที่ต้องชำระ (${grandTotal.toLocaleString()} บาท)`
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

  const handlePay = async () => {
    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum < grandTotal) {
      alert(`ยอดชำระต้องไม่ต่ำกว่า ${grandTotal.toLocaleString()} บาท`);
      return;
    }

    if (!slipFile) {
      alert("กรุณาแนบสลิปการโอนเงิน");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("userId", currentUser.id);
      formData.append("amount", amountNum);
      formData.append("slip", slipFile);
      formData.append("verifiedByOcr", amountLocked ? "true" : "false");

      const res = await fetch("/api/orders/pay-all", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ชำระเงินไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      setPaidSuccess(true);
      alert("ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว รอการตรวจสอบและอนุมัติ");
      setOrders(orders.filter((o) => o.status !== "pending"));
      setSlipFile(null);
      setSlipPreview(null);
      setAmount("");
      setAmountLocked(false);
      setOcrMessage("");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAll = async () => {
    if (!confirm("ยืนยันยกเลิกคำสั่งซื้อทั้งหมด? สินค้าจะถูกย้ายกลับไปที่ตะกร้า")) return;

    setCancelling(true);

    try {
      const res = await fetch("/api/orders/cancel-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ยกเลิกไม่สำเร็จ");
        setCancelling(false);
        return;
      }

      setOrders(orders.filter((o) => o.status !== "pending"));
      alert("ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว สินค้าถูกย้ายกลับไปที่ตะกร้า");
      onNavigate("cart");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Header
        onNavigate={handleLeaveNavigate}
        onLogoClick={handleLeaveLogoClick}
        currentUser={currentUser}
        onLogout={handleLeaveLogout}
      />

      <div className="payment-page">
        <h2 className="payment-title">ชำระเงินร้านค้า</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : unpaidOrders.length === 0 ? (
          <p className="empty-text">ไม่มีคำสั่งซื้อที่รอชำระเงิน</p>
        ) : (
          <>
            <div className="cart-summary">
              {unpaidOrders.map((order) => (
                <div key={order.id} className="shop-summary-row">
                  <span>
                    {order.product_name} (ไซส์ {order.size || "-"}) × {order.quantity}
                  </span>
                  <span>{order.total.toLocaleString()} บาท</span>
                </div>
              ))}
              <p className="cart-total">ยอดรวมทั้งหมด: {grandTotal.toLocaleString()} บาท</p>
            </div>

            <div className="payment-form" style={{ marginTop: 20 }}>
              <label>แนบสลิปการโอนเงิน</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />

              {slipPreview && (
                <img src={slipPreview} alt="ตัวอย่างสลิป" className="slip-preview" />
              )}

              {ocrProcessing && <p className="ocr-status">🔍 กำลังอ่านยอดจากสลิป...</p>}

              {ocrMessage && !ocrProcessing && <p className="ocr-status">{ocrMessage}</p>}

              <label>จำนวนเงินที่โอน (บาท)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={grandTotal}
                disabled={amountLocked}
                placeholder="แนบสลิปเพื่อให้ระบบอ่านยอดอัตโนมัติ"
              />

              <div className="payment-actions">
                <button
                  className="auth-submit-btn"
                  onClick={handlePay}
                  disabled={submitting || cancelling || ocrProcessing}
                >
                  {submitting ? "กำลังตรวจสอบ..." : "ชำระเงิน"}
                </button>
                <button
                  className="reject-btn"
                  onClick={handleCancelAll}
                  disabled={submitting || cancelling}
                  style={{ flex: 1 }}
                >
                  {cancelling ? "กำลังยกเลิก..." : "ยกเลิกคำสั่งซื้อ"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ShopPayment;
