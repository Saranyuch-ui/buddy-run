function Header({ onLogoClick, onNavigate, currentUser, onLogout }) {
  const navItems = [
    { key: "home", label: "หน้าแรก" },
    { key: "payment", label: "ชำระเงิน" },
    { key: "submit-result", label: "ส่งผลกิจกรรม" },
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
              className="nav-btn"
              onClick={() => onNavigate && onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}

          {currentUser ? (
            <div className="user-info">
              <span className="user-name">
                👤 {currentUser.first_name || currentUser.email}
              </span>
              <button className="nav-btn" onClick={onLogout}>
                ออกจากระบบ
              </button>
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
