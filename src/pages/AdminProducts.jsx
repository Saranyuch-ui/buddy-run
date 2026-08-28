import { useState, useEffect } from "react";
import Header from "../components/Header";

function AdminProducts({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
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
    setForm({ name: "", price: "", description: "", category: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (p) => {
    setForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      description: p.description || "",
      category: p.category || "",
    });
    setImageFile(null);
    setImagePreview(p.image || null);
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category || (!editingId && !imageFile)) {
      alert("กรุณากรอกข้อมูลให้ครบ (รวมถึงรูปภาพ)");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("adminUserId", currentUser.id);
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category);
      if (imageFile) formData.append("image", imageFile);

      let res;
      if (editingId) {
        formData.append("productId", editingId);
        res = await fetch("/api/admin/products", { method: "PUT", body: formData });
      } else {
        res = await fetch("/api/admin/products", { method: "POST", body: formData });
      }

      const data = await res.json();

      if (!data.success) {
        alert(data.error || (editingId ? "แก้ไขสินค้าไม่สำเร็จ" : "เพิ่มสินค้าไม่สำเร็จ"));
        setSubmitting(false);
        return;
      }

      resetForm();
      loadProducts();
      alert(editingId ? "แก้ไขสินค้าเรียบร้อยแล้ว" : "เพิ่มสินค้าเรียบร้อยแล้ว");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("ยืนยันการลบสินค้านี้?")) return;

    setDeletingId(productId);

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId: currentUser.id, productId }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ลบสินค้าไม่สำเร็จ");
        setDeletingId(null);
        return;
      }

      setProducts(products.filter((p) => p.id !== productId));
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
          <h2 className="admin-title">จัดการสินค้า</h2>
          <button
            className="pay-btn"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? "ปิดฟอร์ม" : "+ เพิ่มสินค้า"}
          </button>
        </div>

        {showForm && (
          <form className="auth-form event-form" onSubmit={handleSubmit}>
            <h3 className="form-section-title">
              {editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
            </h3>

            <label>รูปภาพสินค้า{editingId ? " (ไม่บังคับ ถ้าไม่เปลี่ยนจะใช้รูปเดิม)" : ""}</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="slip-preview" />
            )}

            <label>ชื่อสินค้า</label>
            <input value={form.name} onChange={handleChange("name")} />

            <label>ราคา (บาท)</label>
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={handleChange("price")}
            />

            <label>หมวดหมู่</label>
            <input
              value={form.category}
              onChange={handleChange("category")}
              placeholder="เช่น เสื้อผ้า, อุปกรณ์เสริม"
            />

            <label>รายละเอียดสินค้า</label>
            <input value={form.description} onChange={handleChange("description")} />

            <div className="payment-actions">
              <button type="submit" className="auth-submit-btn" disabled={submitting}>
                {submitting ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึกสินค้า"}
              </button>
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={resetForm}
                disabled={submitting}
              >
                ยกเลิก
              </button>
            </div>
          </form>
        )}

        <h2 className="admin-title admin-section-spacing">รายการสินค้าทั้งหมด</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : products.length === 0 ? (
          <p className="empty-text">ยังไม่มีสินค้า</p>
        ) : (
          <div className="admin-list">
            {products.map((p) => (
              <div key={p.id} className="admin-item">
                <div className="admin-info">
                  <h4>{p.name}</h4>
                  <p>{p.price.toLocaleString()} บาท — หมวดหมู่: {p.category || "-"}</p>
                  <p>{p.description}</p>
                </div>
                <div className="admin-actions">
                  <button className="edit-btn" onClick={() => startEdit(p)}>
                    ✏️ แก้ไข
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? "กำลังลบ..." : "🗑️ ลบ"}
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

export default AdminProducts;
