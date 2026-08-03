import { useState, useEffect } from "react";
import Header from "../components/Header";

function Payment({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [amount, setAmount] = useState("");
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
    setAmount(reg.price.toString());
  };

  const handlePay = async (reg) => {
    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum < reg.price) {
      alert(`ยอดชำระต้องไม่ต่ำกว่า ${reg.price.toLocaleString()} บาท`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/registrations/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: reg.id,
          amount: amountNum,
        }),
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
alert("ชำระเงินสำเร็จ! สถานะอัปเดตเป็น 'ชำระเรียบร้อย' แล้ว");
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
                    <label>จำนวนเงินที่โอน (บาท)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={reg.price}
                    />
                    <div className="payment-actions">
                      <button
                        className="auth-submit-btn"
                        onClick={() => handlePay(reg)}
                        disabled={submitting}
                      >
                        {submitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
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
