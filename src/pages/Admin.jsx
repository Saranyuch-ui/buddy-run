import { useState, useEffect } from "react";
import Header from "../components/Header";

function Admin({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

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

  const ocrApprovalPending = pending.filter((r) => r.status === "pending_ocr_approval");
  const paymentPending = pending.filter((r) => r.status === "pending_verification");
  const resultPending = pending.filter((r) => r.status === "result_pending");

  const renderItem = (reg, imageField, imageLabel) => (
    <div key={reg.id} className="admin-item">
      <div className="admin-info">
        <h4>{reg.event_title}</h4>
        <p>{reg.package_name} — ยอดที่ต้องชำระ {reg.price?.toLocaleString()} บาท</p>
        {reg.paid_amount != null && (
          <p className="admin-paid">
            ยอดที่ผู้ใช้แจ้ง: {reg.paid_amount.toLocaleString()} บาท
          </p>
        )}
        <p className="admin-user">
          ผู้ลงทะเบียน: {reg.user_first_name || "-"} {reg.user_last_name || ""} ({reg.user_email})
        </p>
        <p className="reg-date">ส่งเมื่อ: {reg.created_at}</p>

        {reg[imageField] && (
          <button
            className="view-slip-btn"
            onClick={() => setViewingImage(reg[imageField])}
          >
            🖼️ {imageLabel}
          </button>
        )}
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
  );

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="admin-page">
        <h2 className="admin-title">1. รอการอนุมัติ (สลิปตรวจสอบผ่านแล้ว)</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : ocrApprovalPending.length === 0 ? (
          <p className="empty-text">ไม่มีรายการรอการอนุมัติ</p>
        ) : (
          <div className="admin-list">
            {ocrApprovalPending.map((reg) => renderItem(reg, "slip_image", "ดูสลิป"))}
          </div>
        )}

        <h2 className="admin-title admin-section-spacing">2. รอการตรวจสอบและอนุมัติสลิป</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : paymentPending.length === 0 ? (
          <p className="empty-text">ไม่มีรายการรอการตรวจสอบ</p>
        ) : (
          <div className="admin-list">
            {paymentPending.map((reg) => renderItem(reg, "slip_image", "ดูสลิป"))}
          </div>
        )}

        <h2 className="admin-title admin-section-spacing">3. อนุมัติส่งผลกิจกรรม</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : resultPending.length === 0 ? (
          <p className="empty-text">ไม่มีรายการรอการอนุมัติ</p>
        ) : (
          <div className="admin-list">
            {resultPending.map((reg) => renderItem(reg, "result_image", "ดูผลกิจกรรม"))}
          </div>
        )}
      </div>

      {viewingImage && (
        <div className="slip-modal" onClick={() => setViewingImage(null)}>
          <div className="slip-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="slip-modal-close" onClick={() => setViewingImage(null)}>
              ✕
            </button>
            <img src={viewingImage} alt="รูปแนบ" />
          </div>
        </div>
      )}
    </>
  );
}

export default Admin;
