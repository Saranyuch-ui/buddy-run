import { useState, useEffect } from "react";
import Header from "../components/Header";

async function dataUrlToFile(dataUrl, filename) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

function SubmitResult({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [resultFile, setResultFile] = useState(null);
  const [resultPreview, setResultPreview] = useState(null);
  const [resubmitMessage, setResubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetch(`/api/registrations?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRegistrations(data.registrations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoggedIn, currentUser]);

  if (!isLoggedIn) {
    return (
      <>
        <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />
        <div className="coming-soon">
          <h2>กรุณาเข้าสู่ระบบ</h2>
          <p>ต้องเข้าสู่ระบบก่อนเพื่อส่งผลกิจกรรม</p>
          <button className="auth-submit-btn" onClick={() => onNavigate("login")}>
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" (UTC) — ให้ตรงกับ backend
  const paidRegs = registrations.filter((r) => r.status === "paid");
  const readyToSubmit = paidRegs.filter(
    (r) => r.result_start_date && r.result_start_date.slice(0, 10) <= todayStr
  );
  const notYetOpen = paidRegs.filter(
    (r) => !r.result_start_date || r.result_start_date.slice(0, 10) > todayStr
  );

  const startSubmit = async (reg) => {
    setSubmittingId(reg.id);
    setResubmitMessage("");

    if (reg.result_image) {
      // เคยส่งมาก่อนแต่ถูกปฏิเสธ -> แนบรูปเดิมกลับให้อัตโนมัติ
      setResultPreview(reg.result_image);
      setResubmitMessage("📎 นี่คือรูปผลกิจกรรมที่เคยส่งไว้ก่อนหน้านี้ สามารถส่งใหม่หรือแนบไฟล์อื่นแทนได้");

      try {
        const file = await dataUrlToFile(reg.result_image, "previous-result.jpg");
        setResultFile(file);
      } catch (err) {
        setResultFile(null);
      }
    } else {
      setResultFile(null);
      setResultPreview(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResultFile(file);
    setResultPreview(URL.createObjectURL(file));
    setResubmitMessage("");
  };

  const handleSubmit = async (reg) => {
    if (!resultFile) {
      alert("กรุณาแนบรูปผลกิจกรรม");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("registrationId", reg.id);
      formData.append("userId", currentUser.id);
      formData.append("resultImage", resultFile);

      const res = await fetch("/api/registrations/result", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ส่งผลกิจกรรมไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      setRegistrations(
        registrations.map((r) =>
          r.id === reg.id ? { ...r, status: "result_pending" } : r
        )
      );
      setSubmittingId(null);
      setResultFile(null);
      setResultPreview(null);
      alert("ส่งผลกิจกรรมเรียบร้อยแล้ว กรุณารอการอนุมัติจากเจ้าหน้าที่");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="payment-page">
        <h2 className="payment-title">ส่งผลกิจกรรม</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : readyToSubmit.length === 0 && notYetOpen.length === 0 ? (
          <p className="empty-text">ไม่มีกิจกรรมที่พร้อมส่งผล</p>
        ) : (
          <div className="payment-list">
            {notYetOpen.map((reg) => (
              <div key={reg.id} className="payment-item">
                <div className="payment-info">
                  <h4>{reg.event_title}</h4>
                  <p>{reg.package_name}</p>
                  <p className="ocr-status">
                    ⏳ ยังไม่ถึงวันเริ่มส่งผลกิจกรรม
                    {reg.result_start_date
                      ? ` (เริ่มวันที่ ${reg.result_start_date.slice(0, 10)})`
                      : ""}
                  </p>
                </div>
                <button className="pay-btn" disabled>
                  ส่งผลกิจกรรม
                </button>
              </div>
            ))}

            {readyToSubmit.map((reg) => (
              <div key={reg.id} className="payment-item">
                <div className="payment-info">
                  <h4>{reg.event_title}</h4>
                  <p>{reg.package_name}</p>
                </div>

                {submittingId === reg.id ? (
                  <div className="payment-form">
                    <label>แนบรูปผลกิจกรรม (เช่น รูปเหรียญ, ผลวิ่ง, หน้าจอแอปวิ่ง)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                    />

                    {resultPreview && (
                      <img
                        src={resultPreview}
                        alt="ตัวอย่างผลกิจกรรม"
                        className="slip-preview"
                      />
                    )}

                    {resubmitMessage && (
                      <p className="ocr-status">{resubmitMessage}</p>
                    )}

                    <div className="payment-actions">
                      <button
                        className="auth-submit-btn"
                        onClick={() => handleSubmit(reg)}
                        disabled={submitting}
                      >
                        {submitting ? "กำลังส่ง..." : "ส่งผลกิจกรรม"}
                      </button>
                      <button
                        className="auth-secondary-btn"
                        onClick={() => setSubmittingId(null)}
                        disabled={submitting}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="pay-btn" onClick={() => startSubmit(reg)}>
                    ส่งผลกิจกรรม
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SubmitResult;
