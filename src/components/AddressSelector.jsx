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

function AddressSelector({ currentUser, selectedAddressId, onSelect, onNavigate }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    fetch(`/api/addresses?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAddresses(data.addresses);
          if (!selectedAddressId && data.addresses.length > 0) {
            const def = data.addresses.find((a) => a.is_default) || data.addresses[0];
            onSelect(def.id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser?.id]);

  if (loading) {
    return <p className="empty-text">กำลังโหลดที่อยู่จัดส่ง...</p>;
  }

  if (addresses.length === 0) {
    return (
      <div className="shop-size-row">
        <label>ที่อยู่จัดส่ง</label>
        <p className="ocr-status">
          ยังไม่มีที่อยู่จัดส่ง กรุณาไปเพิ่มที่อยู่ที่หน้าโปรไฟล์ก่อน
        </p>
        <button
          type="button"
          className="auth-secondary-btn"
          onClick={() => onNavigate("profile")}
        >
          ไปเพิ่มที่อยู่
        </button>
      </div>
    );
  }

  return (
    <div className="shop-size-row">
      <label>ที่อยู่จัดส่ง</label>
      <div className="admin-list">
        {addresses.map((a) => (
          <label
            key={a.id}
            className="admin-item"
            style={{ cursor: "pointer", display: "flex", gap: "10px", alignItems: "flex-start" }}
          >
            <input
              type="radio"
              name={`shippingAddress-${currentUser.id}`}
              checked={selectedAddressId === a.id}
              onChange={() => onSelect(a.id)}
              style={{ marginTop: "4px" }}
            />
            <div className="admin-info">
              <h4>
                {a.label || "ที่อยู่จัดส่ง"}
                {a.is_default ? " ⭐" : ""}
              </h4>
              <p>{a.recipient_name} — {a.phone}</p>
              <p>{formatAddressLine(a)}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default AddressSelector;
