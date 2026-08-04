import { useState } from "react";
import Header from "../components/Header";
import packages from "../data/packages";

function Detail({ event, onBack, onNavigate, isLoggedIn, currentUser, onLogout }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!event) {
    return (
      <>
        <Header onNavigate={onNavigate} onLogoClick={onBack} currentUser={currentUser} onLogout={onLogout} />
        <div className="detail">
          <p>ไม่พบข้อมูลกิจกรรม</p>
          <button onClick={onBack}>← Back</button>
        </div>
      </>
    );
  }

  const handleRegister = async () => {
    if (!selectedPackage) return;

    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบก่อนลงทะเบียนกิจกรรม");
      onNavigate("login");
      return;
    }

    const pkg = packages.find((p) => p.id === selectedPackage);

    setSubmitting(true);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          eventId: event.id,
          packageId: pkg.id,
          eventTitle: event.title,
          packageName: pkg.name,
          price: pkg.price,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ลงทะเบียนไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      setRegistered(true);
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header onNavigate={onNavigate} onLogoClick={onBack} currentUser={currentUser} onLogout={onLogout} />
      <div className="detail">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <img src={event.image} alt={event.title} />

        <div className="detail-body">
          <h2>{event.title}</h2>

          <p>📅 เริ่ม: {event.date}</p>
          <p>🏁 สิ้นสุด: {event.endDate}</p>
          <p>📍 {event.location}</p>
          <p>🏃 {event.distance}</p>
          <p>{event.description}</p>

          <h3 className="package-title">เลือกแพ็กเกจลงทะเบียน</h3>

          <div className="package-list">
            {packages.map((pkg) => (
              <label
                key={pkg.id}
                className={
                  "package-card" +
                  (selectedPackage === pkg.id ? " package-selected" : "")
                }
              >
                <input
                  type="radio"
                  name="package"
                  value={pkg.id}
                  checked={selectedPackage === pkg.id}
                  onChange={() => setSelectedPackage(pkg.id)}
                />
                <div className="package-info">
                  <h4>{pkg.name}</h4>
                  <p>{pkg.detail}</p>
                  <p className="package-price">{pkg.price.toLocaleString()} บาท</p>
                </div>
              </label>
            ))}
          </div>

          {registered ? (
            <p className="register-success">
              ✅ ลงทะเบียน {event.title} เรียบร้อยแล้ว
            </p>
          ) : (
            <button
              className="register-btn"
              disabled={!selectedPackage || submitting}
              onClick={handleRegister}
            >
              {submitting ? "กำลังลงทะเบียน..." : "ลงทะเบียนกิจกรรมนี้"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Detail;
