import { useState, useEffect } from "react";
import Header from "../components/Header";

function AdminMembers({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) return;

    fetch(`/api/admin/members?adminUserId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMembers(data.members);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser]);

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

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.username || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.first_name || "").toLowerCase().includes(q) ||
      (m.last_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="admin-page">
        <div className="admin-events-header">
          <h2 className="admin-title">สมาชิกทั้งหมด ({members.length})</h2>
        </div>

        <div className="search-box" style={{ justifyContent: "flex-start", marginBottom: 20 }}>
          <input
            type="text"
            placeholder="ค้นหาจาก User ID, Email, ชื่อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : filteredMembers.length === 0 ? (
          <p className="empty-text">ไม่พบสมาชิก</p>
        ) : (
          <div className="admin-list">
            {filteredMembers.map((m) => (
              <div key={m.id} className="admin-item">
                <div className="admin-info">
                  <h4>
                    {m.first_name || "-"} {m.last_name || ""}
                    {m.is_admin === 1 && <span className="admin-badge"> ผู้ดูแลระบบ</span>}
                  </h4>
                  <p>User ID: {m.username || "-"}</p>
                  <p>Email: {m.email}</p>
                  <p>เบอร์โทรศัพท์: {m.phone || "-"}</p>
                  <p className="reg-date">สมัครเมื่อ: {m.created_at}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminMembers;
