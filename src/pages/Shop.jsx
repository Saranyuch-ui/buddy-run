import { useState, useEffect } from "react";
import Header from "../components/Header";

function Shop({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [quantity, setQuantity] = useState(1);
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

  const startBuy = (product) => {
    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า");
      onNavigate("login");
      return;
    }
    setBuyingId(product.id);
    setQuantity(1);
  };

  const handleConfirmOrder = async (product) => {
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: product.id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "สั่งซื้อไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      alert(`สั่งซื้อ "${product.name}" จำนวน ${quantity} ชิ้น เรียบร้อยแล้ว`);
      setBuyingId(null);
      setQuantity(1);
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
            {products.map((product) => (
              <div key={product.id} className="card">
                <img src={product.image} alt={product.name} />

                <div className="card-body">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p className="package-price">{product.price.toLocaleString()} บาท</p>

                  {buyingId === product.id ? (
                    <div className="shop-buy-form">
                      <div className="shop-qty-row">
                        <label>จำนวน</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        />
                      </div>
                      <p className="admin-paid">
                        รวม: {(product.price * quantity).toLocaleString()} บาท
                      </p>
                      <button
                        onClick={() => handleConfirmOrder(product)}
                        disabled={submitting}
                      >
                        {submitting ? "กำลังสั่งซื้อ..." : "ยืนยันสั่งซื้อ"}
                      </button>
                      <button
                        className="auth-secondary-btn"
                        onClick={() => setBuyingId(null)}
                        disabled={submitting}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startBuy(product)}>ซื้อสินค้า</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Shop;
