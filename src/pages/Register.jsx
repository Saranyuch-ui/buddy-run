import { useState } from "react";
import Header from "../components/Header";

function Register({ onNavigate, onLogoClick }) {
  const [form, setForm] = useState({
    username: "",
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
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const requiredFields = [
    { key: "username", label: "User ID" },
    { key: "email", label: "Email" },
    { key: "password", label: "Password" },
    { key: "confirmPassword", label: "Confirm Password" },
    { key: "shirtSize", label: "ไซส์เสื้อ" },
    { key: "houseNo", label: "บ้านเลขที่" },
    { key: "subDistrict", label: "ตำบล" },
    { key: "district", label: "อำเภอ" },
    { key: "province", label: "จังหวัด" },
    { key: "postalCode", label: "รหัสไปรษณีย์" },
    { key: "phone", label: "เบอร์โทรศัพท์" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = requiredFields.filter(
      (field) => !form[field.key].trim()
    );

    if (missing.length > 0) {
      alert(
        "กรุณากรอกข้อมูลให้ครบ:\n" +
          missing.map((f) => "- " + f.label).join("\n")
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "สมัครสมาชิกไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      alert("สมัครสมาชิกเรียบร้อยแล้ว");
      onNavigate("login");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />

      <div className="auth-page">
        <form className="auth-form register-form" onSubmit={handleSubmit}>
          <h2>สมัครสมาชิก</h2>

          <h3 className="form-section-title">ข้อมูลบัญชี</h3>

          <label>
            User ID <span className="required-mark">*</span>
          </label>
          <input
            value={form.username}
            onChange={handleChange("username")}
          />

          <label>ชื่อ</label>
          <input value={form.firstName} onChange={handleChange("firstName")} />

          <label>นามสกุล</label>
          <input value={form.lastName} onChange={handleChange("lastName")} />

          <label>
            Email <span className="required-mark">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
          />

          <label>
            Password <span className="required-mark">*</span>
          </label>
          <input
            type="password"
            value={form.password}
            onChange={handleChange("password")}
          />

          <label>
            Confirm Password <span className="required-mark">*</span>
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
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

          <label>
            ไซส์เสื้อ <span className="required-mark">*</span>
          </label>
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

          <label>
            บ้านเลขที่ <span className="required-mark">*</span>
          </label>
          <input value={form.houseNo} onChange={handleChange("houseNo")} />

          <label>หมู่</label>
          <input value={form.moo} onChange={handleChange("moo")} />

          <label>ซอย</label>
          <input value={form.soi} onChange={handleChange("soi")} />

          <label>ถนน</label>
          <input value={form.road} onChange={handleChange("road")} />

          <label>
            ตำบล <span className="required-mark">*</span>
          </label>
          <input
            value={form.subDistrict}
            onChange={handleChange("subDistrict")}
          />

          <label>
            อำเภอ <span className="required-mark">*</span>
          </label>
          <input value={form.district} onChange={handleChange("district")} />

          <label>
            จังหวัด <span className="required-mark">*</span>
          </label>
          <input value={form.province} onChange={handleChange("province")} />

          <label>
            รหัสไปรษณีย์ <span className="required-mark">*</span>
          </label>
          <input
            value={form.postalCode}
            onChange={handleChange("postalCode")}
          />

          <label>
            เบอร์โทรศัพท์ <span className="required-mark">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
          />

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}
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
