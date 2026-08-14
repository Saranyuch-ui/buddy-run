import { useState, useEffect } from "react";
import Header from "../components/Header";

const SIZES = ["S", "M", "L", "XL"];

function Shop({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getSelection = (productId) =>
    selection[productId] || { size: "", quantity: 1 };

  const setSize = (productId, size) => {
    setSelection({
      ...selection,
      [productId]: { ...getSelection(productId), size },
    });
  };

  const setQuantity = (productId, quantity) => {
    setSelection({
      ...selection,
      [productId]: { ...getSelection(productId), quantity: Math.max(1, quantity) },
    });
  };

  const requireLoginAndSize = (product) => {
    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า");
      onNavigate("login");
      return false;
    }
    const sel = getSelection(product.id);
    if (!sel.size) {
      alert("กรุณาเลือกไซส์ก่อน");
      return false;
    }
    return true;
  };

  const handleAddToCart = async (product) => {
    if (!requireLoginAndSize(product)) return;

    const sel = getSelection(product.id);
    setSubmitting(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: product.id,
          quantity: sel.quantity,
          size: sel.size,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "เพิ่มสินค้าลงตะกร้าไม่สำเร็จ");
        return;
      }

      alert(`เพิ่ม "${product.name}" (ไซส์ ${sel.size}) ลงตะกร้าแล้ว`);
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuyNow = async (product) => {
    if (!requireLoginAndSize(product)) return;

    const sel = getSelection(product.id);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: product.id,
          quantity: sel.quantity,
          size: sel.size,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "สั่งซื้อไม่สำเร็จ");
        return;
      }

      onNavigate("shop-payment");
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

      <section className="event-section">
        <h2 className="section-title">🛍️ ร้านค้า Buddy Run</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : products.length === 0 ? (
          <p className="empty-text">ยังไม่มีสินค้า</p>
        ) : (
          <div className="grid">
            {products.map((product) => {
              const sel = getSelection(product.id);
              return (
                <div key={product.id} className="card">
                  <img src={product.image} alt={product.name} />

                  <div className="card-body">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p className="package-price">{product.price.toLocaleString()} บาท</p>

                    <div className="shop-size-row">
                      <label>ไซส์</label>
                      <div className="shop-size-options">
                        {SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={
                              "shop-size-btn" + (sel.size === s ? " shop-size-selected" : "")
                            }
                            onClick={() => setSize(product.id, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="shop-qty-row">
                      <label>จำนวน</label>
                      <input
                        type="number"
                        min="1"
                        value={sel.quantity}
                        onChange={(e) => setQuantity(product.id, Number(e.target.value))}
                      />
                    </div>

                    <div className="shop-btn-row">
                      <button
                        className="shop-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={submitting}
                      >
                        ใส่ตะกร้า
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={submitting}
                      >
                        ซื้อสินค้า
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default Shop;
