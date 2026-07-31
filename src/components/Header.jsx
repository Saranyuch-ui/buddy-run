function Header({ onLogoClick, onNavigate }) {
  const navItems = [
    { key: "home", label: "หน้าแรก" },
    { key: "payment", label: "ชำระเงิน" },
    { key: "submit-result", label: "ส่งผลกิจกรรม" },
    { key: "contact", label: "ติดต่อเรา" },
    { key: "login", label: "Login" },
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
        </nav>
      </div>
    </header>
  );
}

export default Header;
