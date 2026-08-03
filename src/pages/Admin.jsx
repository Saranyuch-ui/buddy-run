import { useState, useEffect } from "react";
import Header from "../components/Header";

function Admin({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadPending = () => {
    setLoading(true);
    fetch(`/api/admin/pending?adminUserId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPending(data.registrations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentUser || !currentUser.is_admin) {
    return (
      <>
        <Header
          onNavigate={onNavigate}
          onLogoClick={onLogoClick}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="coming-soon">
          <h2>🚫 ไม่มีสิทธิ์เข้าถึง</h2>
          <p>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
        </div>
      </>
    );
  }

  const handleReview = async (registrationId, action) => {
    setProcessingId(registrationId);

    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId: currentUser.id,
          registrationId,
          action,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ดำเนินการไม่สำเร็จ");
        setProcessingId(null);
        return;
      }

      setPending(pending.filter((p) => p.id !== registrationId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setProcessingId(null);
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

      <div className="admin-page">
        <h2 className="admin-title">รายการรอการอนุมัติ</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : pending.length === 0 ? (
          <p className="empty-text">ไม่มีรายการรอการอนุมัติ</p>
        ) : (
          <div className="admin-list">
            {pending.map((reg) => (
              <div key={reg.id} className="admin-item">
                <div className="admin-info">
                  <h4>{reg.event_title}</h4>
                  <p>{reg.package_name} — ยอดที่ต้องชำระ {reg.price?.toLocaleString()} บาท</p>
                  <p className="admin-paid">
                    ยอดที่ผู้ใช้แจ้ง: {reg.paid_amount?.toLocaleString()} บาท
                  </p>
                  <p className="admin-user">
                    ผู้ลงทะเบียน: {reg.user_first_name || "-"} {reg.user_last_name || ""} ({reg.user_email})
                  </p>
                  <p className="reg-date">ส่งเมื่อ: {reg.created_at}</p>
                </div>

                <div className="admin-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleReview(reg.id, "approve")}
                    disabled={processingId === reg.id}
                  >
                    ✅ อนุมัติ
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReview(reg.id, "reject")}
                    disabled={processingId === reg.id}
                  >
                    ❌ ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Admin;
