import { useState, useEffect } from "react";
import Header from "../components/Header";

function Profile({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    fetch(`/api/registrations?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRegistrations(data.registrations);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser]);

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
          <h2>ข้อมูลสมาชิก</h2>
          <p><strong>ชื่อ:</strong> {currentUser.first_name || "-"}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
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
                    {reg.status === "confirmed" ? "ยืนยันแล้ว" : reg.status}
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
