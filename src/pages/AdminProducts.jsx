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

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

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

  const loadCategories = () => {
    setCategoriesLoading(true);
    fetch(`/api/admin/categories?adminUserId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
        setCategoriesLoading(false);
      })
      .catch(() => setCategoriesLoading(false));
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setAddingCategory(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId: currentUser.id, name: trimmed }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "เพิ่มหมวดหมู่ไม่สำเร็จ");
        return;
      }

      setNewCategoryName("");
      loadCategories();
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("ยืนยันการลบหมวดหมู่นี้? (สินค้าที่เคยตั้งหมวดหมู่นี้ไว้จะไม่ถูกลบ)")) return;

    setDeletingCategoryId(categoryId);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId: currentUser.id, categoryId }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ลบหมวดหมู่ไม่สำเร็จ");
        return;
      }

      setCategories(categories.filter((c) => c.id !== categoryId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeletingCategoryId(null);
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

  <div className="admin-tabs">
    <button
      className={
        "admin-tab" +
        (activeTab === "products" ? " admin-tab-active" : "")
      }
      onClick={() => setActiveTab("products")}
    >
      จัดการสินค้า
    </button>

    <button
      className={
        "admin-tab" +
        (activeTab === "categories" ? " admin-tab-active" : "")
      }
      onClick={() => setActiveTab("categories")}
    >
      จัดการหมวดหมู่สินค้า
    </button>
  </div>
        {activeTab === "categories" && (
<>
        <h2 className="admin-title">จัดการหมวดหมู่สินค้า</h2>

        <form className="auth-form event-form" onSubmit={handleAddCategory}>
          <label>เพิ่มหมวดหมู่ใหม่</label>
          <div className="payment-actions">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="เช่น รองเท้า"
              style={{ flex: 1 }}
            />
            <button type="submit" className="auth-submit-btn" disabled={addingCategory}>
              {addingCategory ? "กำลังเพิ่ม..." : "+ เพิ่มหมวดหมู่"}
            </button>
          </div>
        </form>

        {categoriesLoading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : categories.length === 0 ? (
          <p className="empty-text">ยังไม่มีหมวดหมู่ กรุณาเพิ่มก่อนเพิ่มสินค้า</p>
        ) : (
          <div className="admin-list">
            {categories.map((c) => (
              <div key={c.id} className="admin-item">
                <div className="admin-info">
                  <h4>{c.name}</h4>
                </div>
                <div className="admin-actions">
                  <button
                    className="reject-btn"
                    onClick={() => handleDeleteCategory(c.id)}
                    disabled={deletingCategoryId === c.id}
                  >
                    {deletingCategoryId === c.id ? "กำลังลบ..." : "🗑️ ลบ"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
  </>
)}

        {activeTab === "products" && (
<>
        <div className="admin-events-header admin-section-spacing">
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
            {categories.length === 0 ? (
              <p className="ocr-status">⚠️ ยังไม่มีหมวดหมู่ กรุณาเพิ่มหมวดหมู่ด้านบนก่อน</p>
            ) : (
              <select value={form.category} onChange={handleChange("category")}>
                <option value="">— เลือกหมวดหมู่ —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

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
