import { useState } from "react";
import Header from "../components/Header";

function Login({ onNavigate, onLogoClick, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("กรุณากรอก User ID และ Password");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      onLoginSuccess(data.user);
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />

      <div className="auth-page">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>เข้าสู่ระบบ</h2>

          <label>User ID</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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
