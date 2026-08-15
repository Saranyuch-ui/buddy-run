import { useState, useEffect } from "react";

function Header({ onLogoClick, onNavigate, currentUser, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [counts, setCounts] = useState({ unpaid: 0, resultPending: 0, cart: 0 });

  useEffect(() => {
    if (!currentUser) {
      setCounts({ unpaid: 0, resultPending: 0, cart: 0 });
      return;
    }

    fetch(`/api/nav-counts?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCounts({
            unpaid: data.unpaid,
            resultPending: data.resultPending,
            cart: data.cart,
          });
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const navItems = [
    { key: "home", label: "หน้าแรก" },
    { key: "shop", label: "ร้านค้า" },
    { key: "payment", label: "ชำระเงิน", badge: counts.unpaid },
    { key: "submit-result", label: "ส่งผลกิจกรรม", badge: counts.resultPending },
    { key: "cart", label: "ตะกร้า", badge: counts.cart },
    { key: "contact", label: "ติดต่อเรา" },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <div
          className="header-logo-wrap"
          onClick={onLogoClick}
          style={{ cursor: onLogoClick ? "pointer" : "default" }}
        >
          <img src="/logo.png" alt="Buddy Run Logo" className="logo" />
          <div className="header-text">
            <h1>Buddy Run</h1>
            <p>Run Together, Better Together</p>
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className="nav-btn nav-btn-with-badge"
              onClick={() => onNavigate && onNavigate(item.key)}
            >
              {item.label}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}

          {currentUser ? (
            <div className="user-dropdown">
              <button
                className="nav-btn user-dropdown-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                👤 {currentUser.first_name || currentUser.email} ▾
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate("profile");
                    }}
                  >
                    ข้อมูลสมาชิก
                  </button>
                  {currentUser.is_admin === 1 && (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate("admin-dashboard");
                      }}
                    >
                      📊 Dashboard
                    </button>
                  )}
                  {currentUser.is_admin === 1 && (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate("admin");
                      }}
                    >
                      🛠️ จัดการอนุมัติ
                    </button>
                  )}
                  {currentUser.is_admin === 1 && (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate("admin-events");
                      }}
                    >
                      🏁 จัดการกิจกรรม
                    </button>
                  )}
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="nav-btn"
              onClick={() => onNavigate && onNavigate("login")}
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
