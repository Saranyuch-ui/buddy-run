import { useState, useEffect } from "react";
import Header from "../components/Header";
import AddressSelector from "../components/AddressSelector";

function Cart({ onNavigate, onLogoClick, isLoggedIn, currentUser, onLogout }) {
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const loadCart = () => {
    setLoading(true);
    fetch(`/api/cart?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCartItems(data.cartItems);
          setSelectedIds([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <>
        <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />
        <div className="coming-soon">
          <h2>กรุณาเข้าสู่ระบบ</h2>
          <p>ต้องเข้าสู่ระบบก่อนเพื่อดูตะกร้าสินค้า</p>
          <button className="auth-submit-btn" onClick={() => onNavigate("login")}>
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </>
    );
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRemove = async (cartItemId) => {
    setRemovingId(cartItemId);

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, cartItemId }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ลบสินค้าไม่สำเร็จ");
        setRemovingId(null);
        return;
      }

      setCartItems(cartItems.filter((i) => i.id !== cartItemId));
      setSelectedIds(selectedIds.filter((id) => id !== cartItemId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (selectedIds.length === 0) {
      alert("กรุณาเลือกรายการที่ต้องการชำระ");
      return;
    }

    if (!selectedAddressId) {
      alert("กรุณาเลือกที่อยู่จัดส่งก่อน");
      return;
    }

    setCheckingOut(true);

    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          cartItemIds: selectedIds,
          addressId: selectedAddressId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ดำเนินการไม่สำเร็จ");
        setCheckingOut(false);
        return;
      }

      onNavigate("shop-payment");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setCheckingOut(false);
    }
  };

  const selectedTotal = cartItems
    .filter((i) => selectedIds.includes(i.id))
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="payment-page">
        <h2 className="payment-title">ตะกร้าสินค้า</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : cartItems.length === 0 ? (
          <p className="empty-text">ตะกร้าว่างเปล่า</p>
        ) : (
          <>
            <div className="payment-list">
              {cartItems.map((item) => (
                <div key={item.id} className="payment-item">
                  <label className="cart-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                    <div className="payment-info">
                      <h4>{item.product_name}</h4>
                      <p>ไซส์ {item.size} — จำนวน {item.quantity} ชิ้น</p>
                      <p className="payment-price">
                        {(item.price * item.quantity).toLocaleString()} บาท
                      </p>
                    </div>
                  </label>
                  <button
                    className="reject-btn"
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                  >
                    {removingId === item.id ? "กำลังลบ..." : "ลบ"}
                  </button>
                </div>
              ))}
            </div>

            <AddressSelector
              currentUser={currentUser}
              selectedAddressId={selectedAddressId}
              onSelect={setSelectedAddressId}
              onNavigate={onNavigate}
            />

            <div className="cart-summary">
              <p className="cart-total">
                รวมที่เลือก ({selectedIds.length} รายการ): {selectedTotal.toLocaleString()} บาท
              </p>
              <button
                className="auth-submit-btn"
                onClick={handleCheckout}
                disabled={checkingOut || selectedIds.length === 0 || !selectedAddressId}
              >
                {checkingOut ? "กำลังดำเนินการ..." : "ดำเนินการชำระเงิน"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;
