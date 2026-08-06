import { useState, useEffect } from "react";
import Header from "../components/Header";

function AdminEvents({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    challenge: "",
    location: "",
    distance: "",
    regStartDate: "",
    regEndDate: "",
    resultStartDate: "",
    resultEndDate: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadEvents = () => {
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEvents(data.events);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  if (!currentUser || !currentUser.is_admin) {
    return (
      <>
        <Header
          onNavigate={onNavigate}
          onLogoClick={onLogoClick}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="coming-soon">
          <h2>🚫 ไม่มีสิทธิ์เข้าถึง</h2>
          <p>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
        </div>
      </>
    );
  }

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({
      title: "",
      challenge: "",
      location: "",
      distance: "",
      regStartDate: "",
      regEndDate: "",
      resultStartDate: "",
      resultEndDate: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      form.title,
      form.challenge,
      form.location,
      form.distance,
      form.regStartDate,
      form.regEndDate,
      form.resultStartDate,
      form.resultEndDate,
      imageFile,
    ];

    if (required.some((v) => !v)) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง (รวมถึงรูปภาพ)");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("adminUserId", currentUser.id);
      formData.append("title", form.title);
      formData.append("challenge", form.challenge);
      formData.append("location", form.location);
      formData.append("distance", form.distance);
      formData.append("regStartDate", form.regStartDate);
      formData.append("regEndDate", form.regEndDate);
      formData.append("resultStartDate", form.resultStartDate);
      formData.append("resultEndDate", form.resultEndDate);
      formData.append("image", imageFile);

      const res = await fetch("/api/admin/events", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "เพิ่มกิจกรรมไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      resetForm();
      loadEvents();
      alert("เพิ่มกิจกรรมเรียบร้อยแล้ว");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("ยืนยันการลบกิจกรรมนี้?")) return;

    setDeletingId(eventId);

    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId: currentUser.id, eventId }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ลบกิจกรรมไม่สำเร็จ");
        setDeletingId(null);
        return;
      }

      setEvents(events.filter((e) => e.id !== eventId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeletingId(null);
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

      <div className="admin-page">
        <div className="admin-events-header">
          <h2 className="admin-title">จัดการกิจกรรม</h2>
          <button className="pay-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "ปิดฟอร์ม" : "+ เพิ่มกิจกรรม"}
          </button>
        </div>

        {showForm && (
          <form className="auth-form event-form" onSubmit={handleSubmit}>
            <label>รูปภาพกิจกรรม</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="slip-preview" />
            )}

            <label>ชื่อกิจกรรม</label>
            <input value={form.title} onChange={handleChange("title")} />

            <label>Challenge (รายละเอียดกิจกรรม)</label>
            <input value={form.challenge} onChange={handleChange("challenge")} />

            <label>สถานที่</label>
            <input value={form.location} onChange={handleChange("location")} />

            <label>ระยะทาง (เช่น 5K / 10K / 21K)</label>
            <input value={form.distance} onChange={handleChange("distance")} />

            <h3 className="form-section-title">ช่วงลงทะเบียน</h3>
            <div className="edit-form-grid">
              <div className="field">
                <label>วันเริ่มลงทะเบียน</label>
                <input type="date" value={form.regStartDate} onChange={handleChange("regStartDate")} />
              </div>
              <div className="field">
                <label>วันสิ้นสุดลงทะเบียน</label>
                <input type="date" value={form.regEndDate} onChange={handleChange("regEndDate")} />
              </div>
            </div>

            <h3 className="form-section-title">ช่วงส่งผลกิจกรรม</h3>
            <div className="edit-form-grid">
              <div className="field">
                <label>วันเริ่มส่งผลกิจกรรม</label>
                <input type="date" value={form.resultStartDate} onChange={handleChange("resultStartDate")} />
              </div>
              <div className="field">
                <label>วันสิ้นสุดส่งผลกิจกรรม</label>
                <input type="date" value={form.resultEndDate} onChange={handleChange("resultEndDate")} />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              {submitting ? "กำลังบันทึก..." : "บันทึกกิจกรรม"}
            </button>
          </form>
        )}

        <h2 className="admin-title admin-section-spacing">รายการกิจกรรมทั้งหมด</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : events.length === 0 ? (
          <p className="empty-text">ยังไม่มีกิจกรรม</p>
        ) : (
          <div className="admin-list">
            {events.map((ev) => (
              <div key={ev.id} className="admin-item">
                <div className="admin-info">
                  <h4>{ev.title}</h4>
                  <p>📝 ลงทะเบียน: {ev.reg_start_date} - {ev.reg_end_date}</p>
                  <p>📤 ส่งผลกิจกรรม: {ev.result_start_date} - {ev.result_end_date}</p>
                  <p>📍 {ev.location} — 🏃 {ev.distance}</p>
                </div>
                <div className="admin-actions">
                  <button
                    className="reject-btn"
                    onClick={() => handleDelete(ev.id)}
                    disabled={deletingId === ev.id}
                  >
                    {deletingId === ev.id ? "กำลังลบ..." : "🗑️ ลบ"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminEvents;
