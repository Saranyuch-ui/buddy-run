import { useState, useEffect } from "react";
import Header from "../components/Header";

function Profile({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="profile-page">
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

        <div className="profile-card">
          <h2>กิจกรรมที่ลงทะเบียนแล้ว</h2>

          {loading ? (
            <p className="empty-text">กำลังโหลด...</p>
          ) : registrations.length === 0 ? (
            <p className="empty-text">ยังไม่มีกิจกรรมที่ลงทะเบียน</p>
          ) : (
            <div className="reg-list">
              {registrations.map((reg) => (
                <div key={reg.id} className="reg-item">
                  <div>
                    <h4>{reg.event_title}</h4>
                    <p>{reg.package_name} — {reg.price?.toLocaleString()} บาท</p>
                    <p className="reg-date">
                      ลงทะเบียนเมื่อ: {reg.created_at}
                    </p>
                  </div>
                  <span className={`reg-status reg-status-${reg.status}`}>
                    {reg.status === "confirmed"
                      ? "ยืนยันแล้ว"
                      : reg.status === "pending_verification"
                      ? "รอการอนุมัติ"
                      : reg.status === "paid"
                      ? "ชำระเรียบร้อย"
                      : reg.status === "completed"
                      ? "ส่งผลกิจกรรมแล้ว"
                      : reg.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
