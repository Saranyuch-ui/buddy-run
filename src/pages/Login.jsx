import { useState } from "react";
import Header from "../components/Header";

function Login({ onNavigate, onLogoClick, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("กรุณากรอก Email และ Password");
      return;
    }

    onLoginSuccess();
  };

  return (
    <>
      <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />

      <div className="auth-page">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>เข้าสู่ระบบ</h2>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-submit-btn">
            เข้าสู่ระบบ
          </button>

          <div className="auth-divider"></div>

          <button
            type="button"
            className="auth-link-btn"
            onClick={() => onNavigate("forgot-password")}
          >
            ลืมรหัสผ่าน
          </button>

          <button
            type="button"
            className="auth-secondary-btn"
            onClick={() => onNavigate("register")}
          >
            สมัครสมาชิก
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
