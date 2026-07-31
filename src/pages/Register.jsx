import { useState } from "react";
import Header from "../components/Header";

function Register({ onNavigate, onLogoClick }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    gender: "",
    shirtSize: "",
    houseNo: "",
    moo: "",
    soi: "",
    road: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    phone: "",
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    alert("สมัครสมาชิกเรียบร้อยแล้ว");
    onNavigate("login");
  };

  return (
    <>
      <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />

      <div className="auth-page">
        <form className="auth-form register-form" onSubmit={handleSubmit}>
          <h2>สมัครสมาชิก</h2>

          <h3 className="form-section-title">ข้อมูลบัญชี</h3>

          <label>ชื่อ</label>
          <input value={form.firstName} onChange={handleChange("firstName")} />

          <label>นามสกุล</label>
          <input value={form.lastName} onChange={handleChange("lastName")} />

          <label>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            required
          />

          <label>Password *</label>
          <input
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            required
          />

          <label>Confirm Password *</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
          />

          <h3 className="form-section-title">ข้อมูลนักวิ่ง</h3>

          <label>วันเกิด</label>
          <input
            type="date"
            value={form.birthdate}
            onChange={handleChange("birthdate")}
          />

          <label>เพศ</label>
          <select value={form.gender} onChange={handleChange("gender")}>
            <option value="">-- เลือกเพศ --</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
            <option value="other">อื่นๆ</option>
          </select>

          <label>ไซส์เสื้อ</label>
          <select value={form.shirtSize} onChange={handleChange("shirtSize")}>
            <option value="">-- เลือกไซส์ --</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>

          <h3 className="form-section-title">ที่อยู่จัดส่ง</h3>

          <label>บ้านเลขที่</label>
          <input value={form.houseNo} onChange={handleChange("houseNo")} />

          <label>หมู่</label>
          <input value={form.moo} onChange={handleChange("moo")} />

          <label>ซอย</label>
          <input value={form.soi} onChange={handleChange("soi")} />

          <label>ถนน</label>
          <input value={form.road} onChange={handleChange("road")} />

          <label>ตำบล</label>
          <input value={form.subDistrict} onChange={handleChange("subDistrict")} />

          <label>อำเภอ</label>
          <input value={form.district} onChange={handleChange("district")} />

          <label>จังหวัด</label>
          <input value={form.province} onChange={handleChange("province")} />

          <label>รหัสไปรษณีย์</label>
          <input value={form.postalCode} onChange={handleChange("postalCode")} />

          <label>เบอร์โทรศัพท์ *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            required
          />

          <button type="submit" className="auth-submit-btn">
            สมัครสมาชิก
          </button>

          <button
            type="button"
            className="auth-link-btn"
            onClick={() => onNavigate("login")}
          >
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </>
  );
}

export default Register;
