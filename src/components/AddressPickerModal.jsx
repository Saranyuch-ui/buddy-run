import { useState, useEffect } from "react";

function formatAddressLine(a) {
  return [
    a.house_no && `บ้านเลขที่ ${a.house_no}`,
    a.moo && `หมู่ ${a.moo}`,
    a.soi && `ซอย${a.soi}`,
    a.road && `ถนน${a.road}`,
    a.sub_district && `ต.${a.sub_district}`,
    a.district && `อ.${a.district}`,
    a.province && `จ.${a.province}`,
    a.postal_code,
  ]
    .filter(Boolean)
    .join(" ");
}

function AddressPickerModal({ currentUser, onClose, onSelect, onNavigate }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/addresses?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAddresses(data.addresses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser.id]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="admin-page"
        style={{
          background: "white",
          borderRadius: "12px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-events-header">
          <h2 className="admin-title">เลือกที่อยู่จัดส่ง</h2>
          <button className="auth-secondary-btn" onClick={onClose}>
            ✕ ปิด
          </button>
        </div>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : addresses.length === 0 ? (
          <>
            <p className="empty-text">ยังไม่มีที่อยู่ในสมุด</p>
            <button
              className="auth-submit-btn"
              onClick={() => {
                onClose();
                onNavigate("profile");
              }}
            >
              ไปเพิ่มที่อยู่ที่หน้าโปรไฟล์
            </button>
          </>
        ) : (
          <div className="admin-list">
            {addresses.map((a) => (
              <button
                key={a.id}
                type="button"
                className="admin-item"
                style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none" }}
                onClick={() => onSelect(a)}
              >
                <div className="admin-info">
                  <h4>
                    {a.label || "ที่อยู่จัดส่ง"}
                    {a.is_default ? " ⭐ (ค่าเริ่มต้น)" : ""}
                  </h4>
                  <p>{a.recipient_name} — {a.phone}</p>
                  <p>{formatAddressLine(a)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddressPickerModal;
