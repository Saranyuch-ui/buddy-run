import { useState } from "react";

// เปลี่ยนรูปโฆษณาและลิงก์ปลายทางได้ที่นี่
const AD_IMAGE = "/ad-banner.jpg";
const AD_LINK = ""; // ใส่ URL ถ้าต้องการให้คลิกรูปแล้วไปหน้าอื่น เช่น "https://example.com"

function Hero() {
  const [failed, setFailed] = useState(false);

  // ถ้าโหลดรูปไม่ได้ ให้ซ่อนพื้นที่โฆษณาไปเลย ไม่แสดงรูปแตก
  if (failed) return null;

  const img = (
    <img
      src={AD_IMAGE}
      alt="โฆษณา"
      className="hero-ad-img"
      onError={() => setFailed(true)}
    />
  );

  return (
    <section className="hero-ad">
      {AD_LINK ? (
        <a href={AD_LINK} target="_blank" rel="noopener noreferrer sponsored">
          {img}
        </a>
      ) : (
        img
      )}
    </section>
  );
}

export default Hero;
