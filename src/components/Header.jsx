function Header({ onLogoClick }) {
  return (
    <header className="header">
      <div
        className="header-content"
        onClick={onLogoClick}
        style={{ cursor: onLogoClick ? "pointer" : "default" }}
      >
        <img src="/logo.png" alt="Buddy Run Logo" className="logo" />
        <div className="header-text">
          <h1>Buddy Run</h1>
          <p>Run Together, Better Together</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
