import { useState, useEffect } from "react";
import Header from "../components/Header";

const REG_STATUS_LABELS = {
  confirmed: "รอชำระเงิน",
  pending_ocr_approval: "รอการอนุมัติ",
  pending_verification: "รอการตรวจสอบและอนุมัติ",
  paid: "ชำระเงินเรียบร้อย",
  result_pending: "รอการอนุมัติผลกิจกรรม",
  completed: "ส่งผลกิจกรรมแล้ว",
};

const ORDER_STATUS_LABELS = {
  pending: "รอชำระเงิน",
  pending_ocr_approval: "รอการอนุมัติ",
  pending_verification: "รอการตรวจสอบและอนุมัติ",
  paid: "ชำระเงินเรียบร้อย",
};

function isEventExpired(reg) {
  if (!reg.event_end_date) return false;
  return new Date(reg.event_end_date) < new Date();
}

function getRegLabel(reg) {
  if (reg.status === "completed") return "ส่งผลกิจกรรมแล้ว";

  if (
    ["confirmed", "pending_ocr_approval", "pending_verification", "paid"].includes(reg.status) &&
    isEventExpired(reg)
  ) {
    return "หมดเวลากิจกรรม";
  }

  return REG_STATUS_LABELS[reg.status] || reg.status;
}

function getRegStatusClass(reg) {
  if (reg.status === "completed") return "completed";

  if (
    ["confirmed", "pending_ocr_approval", "pending_verification", "paid"].includes(reg.status) &&
    isEventExpired(reg)
  ) {
    return "expired";
  }

  return reg.status;
}

function Profile({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("info");

  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    fetch(`/api/users?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProfile(data.user);
      });

    fetch(`/api/registrations?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRegistrations(data.registrations);
        setRegLoading(false);
      })
      .catch(() => setRegLoading(false));

    fetch(`/api/orders?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  }, [currentUser]);

  const startEdit = () => {
    setForm({ ...profile });
    setEditMode(true);
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          firstName: form.first_name,
          lastName: form.last_name,
          birthdate: form.birthdate,
          gender: form.gender,
          shirtSize: form.shirt_size,
          houseNo: form.house_no,
          moo: form.moo,
          soi: form.soi,
          road: form.road,
          subDistrict: form.sub_district,
          district: form.district,
          province: form.province,
          postalCode: form.postal_code,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "แก้ไขข้อมูลไม่สำเร็จ");
        setSaving(false);
        return;
      }

      setProfile(form);
      setEditMode(false);
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <>
        <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />
        <div className="coming-soon">
          <h2>กรุณาเข้าสู่ระบบ</h2>
        </div>
      </>
    );
  }

  const renderRegItem = (reg, forceGray) => (
    <div key={reg.id} className="reg-item">
      <div>
        <h4>{reg.event_title}</h4>
        <p>{reg.package_name} — {reg.price?.toLocaleString()} บาท</p>
        <p className="reg-date">ลงทะเบียนเมื่อ: {reg.created_at}</p>
      </div>
      <span
        className={`reg-status ${forceGray ? "reg-status-expired" : `reg-status-${getRegStatusClass(reg)}`}`}
      >
        {getRegLabel(reg)}
      </span>
    </div>
  );

  const renderOrderItem = (order) => (
    <div key={order.id} className="reg-item">
      <div>
        <h4>{order.product_name}</h4>
        <p>ไซส์ {order.size || "-"} — จำนวน {order.quantity} ชิ้น — {order.total?.toLocaleString()} บาท</p>
        <p className="reg-date">สั่งซื้อเมื่อ: {order.created_at}</p>
      </div>
      <span className={`reg-status reg-status-${order.status}`}>
        {ORDER_STATUS_LABELS[order.status] || order.status}
      </span>
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

      <div className="profile-page">
        <div className="admin-tabs">
          <button
            className={"admin-tab" + (activeTab === "info" ? " admin-tab-active" : "")}
            onClick={() => setActiveTab("info")}
          >
            ข้อมูลสมาชิก
          </button>
          <button
            className={"admin-tab" + (activeTab === "events" ? " admin-tab-active" : "")}
            onClick={() => setActiveTab("events")}
          >
            ประวัติร่วมกิจกรรม
          </button>
          <button
            className={"admin-tab" + (activeTab === "orders" ? " admin-tab-active" : "")}
            onClick={() => setActiveTab("orders")}
          >
            ประวัติการสั่งซื้อ
          </button>
        </div>

        {activeTab === "info" && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>ข้อมูลสมาชิก</h2>
              {!editMode && profile && (
                <button className="edit-btn" onClick={startEdit}>
                  ✏️ แก้ไขข้อมูล
                </button>
              )}
            </div>

            {!profile ? (
              <p className="empty-text">กำลังโหลด...</p>
            ) : !editMode ? (
              <>
                <p><strong>ชื่อ:</strong> {profile.first_name || "-"} {profile.last_name || ""}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> {profile.phone || "-"}</p>
                <p><strong>ไซส์เสื้อ:</strong> {profile.shirt_size || "-"}</p>
                <p>
                  <strong>ที่อยู่:</strong>{" "}
                  {[
                    profile.house_no,
                    profile.moo && `หมู่ ${profile.moo}`,
                    profile.soi && `ซอย${profile.soi}`,
                    profile.road && `ถนน${profile.road}`,
                    profile.sub_district && `ต.${profile.sub_district}`,
                    profile.district && `อ.${profile.district}`,
                    profile.province && `จ.${profile.province}`,
                    profile.postal_code,
                  ]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </p>
              </>
            ) : (
              <div className="edit-form">
                <h3 className="form-section-title">ข้อมูลส่วนตัว</h3>
                <div className="edit-form-grid">
                  <div className="field">
                    <label>ชื่อ</label>
                    <input value={form.first_name || ""} onChange={handleChange("first_name")} />
                  </div>
                  <div className="field">
                    <label>นามสกุล</label>
                    <input value={form.last_name || ""} onChange={handleChange("last_name")} />
                  </div>
                  <div className="field">
                    <label>วันเกิด</label>
                    <input type="date" value={form.birthdate || ""} onChange={handleChange("birthdate")} />
                  </div>
                  <div className="field">
                    <label>เพศ</label>
                    <select value={form.gender || ""} onChange={handleChange("gender")}>
                      <option value="">-- เลือกเพศ --</option>
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>ไซส์เสื้อ</label>
                    <select value={form.shirt_size || ""} onChange={handleChange("shirt_size")}>
                      <option value="">-- เลือกไซส์ --</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>เบอร์โทรศัพท์</label>
                    <input value={form.phone || ""} onChange={handleChange("phone")} />
                  </div>
                </div>

                <h3 className="form-section-title">ที่อยู่จัดส่ง</h3>
                <div className="edit-form-grid">
                  <div className="field">
                    <label>บ้านเลขที่</label>
                    <input value={form.house_no || ""} onChange={handleChange("house_no")} />
                  </div>
                  <div className="field">
                    <label>หมู่</label>
                    <input value={form.moo || ""} onChange={handleChange("moo")} />
                  </div>
                  <div className="field">
                    <label>ซอย</label>
                    <input value={form.soi || ""} onChange={handleChange("soi")} />
                  </div>
                  <div className="field">
                    <label>ถนน</label>
                    <input value={form.road || ""} onChange={handleChange("road")} />
                  </div>
                  <div className="field">
                    <label>ตำบล</label>
                    <input value={form.sub_district || ""} onChange={handleChange("sub_district")} />
                  </div>
                  <div className="field">
                    <label>อำเภอ</label>
                    <input value={form.district || ""} onChange={handleChange("district")} />
                  </div>
                  <div className="field">
                    <label>จังหวัด</label>
                    <input value={form.province || ""} onChange={handleChange("province")} />
                  </div>
                  <div className="field">
                    <label>รหัสไปรษณีย์</label>
                    <input value={form.postal_code || ""} onChange={handleChange("postal_code")} />
                  </div>
                </div>

                <div className="edit-actions">
                  <button className="auth-submit-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                  <button
                    className="auth-secondary-btn"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (() => {
          const isRegExpired = (r) => {
            if (!r.reg_end_date) return false;
            return new Date(r.reg_end_date) < new Date();
          };

          const paymentGroup = registrations.filter(
            (r) =>
              ["confirmed", "pending_ocr_approval", "pending_verification"].includes(r.status) &&
              !(r.status === "confirmed" && isRegExpired(r))
          );
          const resultGroup = registrations.filter(
            (r) => r.status === "paid" || r.status === "result_pending"
          );
          const historyGroup = registrations.filter(
            (r) =>
              r.status === "completed" ||
              (r.status === "confirmed" && isRegExpired(r)) ||
              (["pending_ocr_approval", "pending_verification", "paid", "result_pending"].includes(
                r.status
              ) &&
                isEventExpired(r))
          );

          return (
            <div className="profile-card">
              <h2>ประวัติร่วมกิจกรรม</h2>

              {regLoading ? (
                <p className="empty-text">กำลังโหลด...</p>
              ) : registrations.length === 0 ? (
                <p className="empty-text">ยังไม่มีประวัติการร่วมกิจกรรม</p>
              ) : (
                <>
                  <h3 className="form-section-title">ชำระเงิน</h3>
                  {paymentGroup.length === 0 ? (
                    <p className="empty-text">ไม่มีรายการในหมวดนี้</p>
                  ) : (
                    <div className="reg-list">{paymentGroup.map(renderRegItem)}</div>
                  )}

                  <h3 className="form-section-title">ส่งผลกิจกรรม</h3>
                  {resultGroup.length === 0 ? (
                    <p className="empty-text">ไม่มีรายการในหมวดนี้</p>
                  ) : (
                    <div className="reg-list">{resultGroup.map(renderRegItem)}</div>
                  )}

                  <h3 className="form-section-title">ประวัติกิจกรรม</h3>
                  {historyGroup.length === 0 ? (
                    <p className="empty-text">ไม่มีรายการในหมวดนี้</p>
                  ) : (
                    <div className="reg-list">
                      {historyGroup.map((reg) => renderRegItem(reg, true))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {activeTab === "orders" && (() => {
          const orderPaymentGroup = orders.filter((o) =>
            ["pending", "pending_ocr_approval", "pending_verification"].includes(o.status)
          );
          const orderHistoryGroup = orders.filter((o) => o.status === "paid");

          return (
            <div className="profile-card">
              <h2>ประวัติการสั่งซื้อ</h2>

              {orderLoading ? (
                <p className="empty-text">กำลังโหลด...</p>
              ) : orders.length === 0 ? (
                <p className="empty-text">ยังไม่มีประวัติการสั่งซื้อ</p>
              ) : (
                <>
                  <h3 className="form-section-title">ชำระเงิน</h3>
                  {orderPaymentGroup.length === 0 ? (
                    <p className="empty-text">ไม่มีรายการในหมวดนี้</p>
                  ) : (
                    <div className="reg-list">{orderPaymentGroup.map(renderOrderItem)}</div>
                  )}

                  <h3 className="form-section-title">ประวัติการสั่งซื้อ</h3>
                  {orderHistoryGroup.length === 0 ? (
                    <p className="empty-text">ไม่มีรายการในหมวดนี้</p>
                  ) : (
                    <div className="reg-list">{orderHistoryGroup.map(renderOrderItem)}</div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </div>
    </>
  );
}

export default Profile;
