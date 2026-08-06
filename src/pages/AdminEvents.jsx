import { useState, useEffect } from "react";
import Header from "../components/Header";

function AdminEvents({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    distance: "",
    description: "",
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
    setForm({ title: "", startDate: "", endDate: "", distance: "", description: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.startDate || !form.endDate || !form.distance || !imageFile) {
      alert("กรุณากรอกข้อมูลให้ครบ (รวมถึงรูปภาพ)");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("adminUserId", currentUser.id);
      formData.append("title", form.title);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      formData.append("distance", form.distance);
      formData.append("description", form.description);
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

            <div className="edit-form-grid">
              <div className="field">
                <label>วันที่เริ่มกิจกรรม</label>
                <input type="date" value={form.startDate} onChange={handleChange("startDate")} />
              </div>
              <div className="field">
                <label>วันที่สิ้นสุดกิจกรรม</label>
                <input type="date" value={form.endDate} onChange={handleChange("endDate")} />
              </div>
            </div>

            <label>ระยะทาง (เช่น 5K / 10K / 21K)</label>
            <input value={form.distance} onChange={handleChange("distance")} />

            <label>รายละเอียดกิจกรรม</label>
            <input value={form.description} onChange={handleChange("description")} />

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
                  <p>{ev.event_date} — {ev.end_date}</p>
                  <p>{ev.distance}</p>
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
