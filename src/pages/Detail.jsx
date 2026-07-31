import { useState } from "react";
import Header from "../components/Header";
import packages from "../data/packages";

function Detail({ event, onBack }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [registered, setRegistered] = useState(false);

  if (!event) {
    return (
      <>
        <Header />
        <div className="detail">
          <p>ไม่พบข้อมูลกิจกรรม</p>
          <button onClick={onBack}>← Back</button>
        </div>
      </>
    );
  }

  const handleRegister = () => {
    if (!selectedPackage) return;
    setRegistered(true);
  };

  return (
  <>
    <Header />
    <div className="detail">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <img src={event.image} alt={event.title} />

      <div className="detail-body">
        <h2>{event.title}</h2>

        <p>📅 {event.date}</p>
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
            ✅ ลงทะเบียน {event.title} ({selectedPackage}) เรียบร้อยแล้ว
          </p>
        ) : (
          <button
            className="register-btn"
            disabled={!selectedPackage}
            onClick={handleRegister}
          >
            ลงทะเบียนกิจกรรมนี้
          </button>
        )}
      </div>
    </div>
  </>
);
}

export default Detail;
