import { useState, useEffect } from "react";
import Header from "../components/Header";

function Admin({ onNavigate, onLogoClick, currentUser, onLogout, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "event");

  const [regPending, setRegPending] = useState([]);
  const [regLoading, setRegLoading] = useState(true);
  const [orderPending, setOrderPending] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);

  const [processingId, setProcessingId] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  const loadRegPending = () => {
    setRegLoading(true);
    fetch(`/api/admin/pending?adminUserId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRegPending(data.registrations);
        setRegLoading(false);
      })
      .catch(() => setRegLoading(false));
  };

  const loadOrderPending = () => {
    setOrderLoading(true);
    fetch(`/api/admin/shop-pending?adminUserId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrderPending(data.orders);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  };

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) return;
    loadRegPending();
    loadOrderPending();
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

  const handleReviewRegistration = async (registrationId, action) => {
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

      setRegPending(regPending.filter((p) => p.id !== registrationId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReviewOrder = async (orderId, action) => {
    setProcessingId(orderId);

    try {
      const res = await fetch("/api/admin/review-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId: currentUser.id,
          orderId,
          action,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ดำเนินการไม่สำเร็จ");
        setProcessingId(null);
        return;
      }

      setOrderPending(orderPending.filter((p) => p.id !== orderId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setProcessingId(null);
    }
  };

  const ocrApprovalPending = regPending.filter((r) => r.status === "pending_ocr_approval");
  const paymentPending = regPending.filter((r) => r.status === "pending_verification");
  const resultPending = regPending.filter((r) => r.status === "result_pending");

  const orderOcrPending = orderPending.filter((o) => o.status === "pending_ocr_approval");
  const orderVerifyPending = orderPending.filter((o) => o.status === "pending_verification");

  const renderRegItem = (reg, imageField, imageLabel) => (
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
          onClick={() => handleReviewRegistration(reg.id, "approve")}
          disabled={processingId === reg.id}
        >
          ✅ อนุมัติ
        </button>
        <button
          className="reject-btn"
          onClick={() => handleReviewRegistration(reg.id, "reject")}
          disabled={processingId === reg.id}
        >
          ❌ ปฏิเสธ
        </button>
      </div>
    </div>
  );

  const renderOrderItem = (order) => (
    <div key={order.id} className="admin-item">
      <div className="admin-info">
        <h4>{order.product_name}</h4>
        <p>จำนวน {order.quantity} ชิ้น — ยอดที่ต้องชำระ {order.total?.toLocaleString()} บาท</p>
        {order.paid_amount != null && (
          <p className="admin-paid">
            ยอดที่ผู้ใช้แจ้ง: {order.paid_amount.toLocaleString()} บาท
          </p>
        )}
        <p className="admin-user">
          ผู้สั่งซื้อ: {order.user_first_name || "-"} {order.user_last_name || ""} ({order.user_email})
        </p>
        <p className="reg-date">ส่งเมื่อ: {order.created_at}</p>

        {order.slip_image && (
          <button
            className="view-slip-btn"
            onClick={() => setViewingImage(order.slip_image)}
          >
            🖼️ ดูสลิป
          </button>
        )}
      </div>

      <div className="admin-actions">
        <button
          className="approve-btn"
          onClick={() => handleReviewOrder(order.id, "approve")}
          disabled={processingId === order.id}
        >
          ✅ อนุมัติ
        </button>
        <button
          className="reject-btn"
          onClick={() => handleReviewOrder(order.id, "reject")}
          disabled={processingId === order.id}
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
        <div className="admin-tabs">
          <button
            className={"admin-tab" + (activeTab === "event" ? " admin-tab-active" : "")}
            onClick={() => setActiveTab("event")}
          >
            Event
          </button>
          <button
            className={"admin-tab" + (activeTab === "shop" ? " admin-tab-active" : "")}
            onClick={() => setActiveTab("shop")}
          >
            Shop
          </button>
        </div>

        {activeTab === "event" && (
          <>
            <h2 className="admin-title admin-section-spacing">1. รอการอนุมัติ (สลิปตรวจสอบผ่านแล้ว)</h2>

            {regLoading ? (
              <p className="empty-text">กำลังโหลด...</p>
            ) : ocrApprovalPending.length === 0 ? (
              <p className="empty-text">ไม่มีรายการรอการอนุมัติ</p>
            ) : (
              <div className="admin-list">
                {ocrApprovalPending.map((reg) => renderRegItem(reg, "slip_image", "ดูสลิป"))}
              </div>
            )}

            <h2 className="admin-title admin-section-spacing">2. รอการตรวจสอบและอนุมัติสลิป</h2>

            {regLoading ? (
              <p className="empty-text">กำลังโหลด...</p>
            ) : paymentPending.length === 0 ? (
              <p className="empty-text">ไม่มีรายการรอการตรวจสอบ</p>
            ) : (
              <div className="admin-list">
                {paymentPending.map((reg) => renderRegItem(reg, "slip_image", "ดูสลิป"))}
              </div>
            )}

            <h2 className="admin-title admin-section-spacing">3. อนุมัติส่งผลกิจกรรม</h2>

            {regLoading ? (
              <p className="empty-text">กำลังโหลด...</p>
            ) : resultPending.length === 0 ? (
              <p className="empty-text">ไม่มีรายการรอการอนุมัติ</p>
            ) : (
              <div className="admin-list">
                {resultPending.map((reg) => renderRegItem(reg, "result_image", "ดูผลกิจกรรม"))}
              </div>
            )}
          </>
        )}

        {activeTab === "shop" && (
          <>
            <h2 className="admin-title admin-section-spacing">1. รอการอนุมัติ (สลิปตรวจสอบผ่านแล้ว)</h2>

            {orderLoading ? (
              <p className="empty-text">กำลังโหลด...</p>
            ) : orderOcrPending.length === 0 ? (
              <p className="empty-text">ไม่มีรายการรอการอนุมัติ</p>
            ) : (
              <div className="admin-list">{orderOcrPending.map(renderOrderItem)}</div>
            )}

            <h2 className="admin-title admin-section-spacing">2. รอการตรวจสอบและอนุมัติสลิป</h2>

            {orderLoading ? (
              <p className="empty-text">กำลังโหลด...</p>
            ) : orderVerifyPending.length === 0 ? (
              <p className="empty-text">ไม่มีรายการรอการตรวจสอบ</p>
            ) : (
              <div className="admin-list">{orderVerifyPending.map(renderOrderItem)}</div>
            )}
          </>
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
