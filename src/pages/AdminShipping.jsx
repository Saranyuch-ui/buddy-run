import { useState, useEffect } from "react";
import Header from "../components/Header";

function toCsv(rows, headers) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headerLine = headers.map((h) => escape(h.label)).join(",");
  const lines = rows.map((row) => headers.map((h) => escape(row[h.key])).join(","));
  return "\uFEFF" + [headerLine, ...lines].join("\r\n");
}

function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function AdminShipping({ onNavigate, onLogoClick, currentUser, onLogout, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "events");
  const [eventItems, setEventItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [marking, setMarking] = useState(false);

  const items = activeTab === "events" ? eventItems : shopItems;

  const loadData = () => {
    setLoading(true);
    setSelectedIds([]);
    const endpoint =
      activeTab === "events" ? "/api/admin/shipping/events" : "/api/admin/shipping/shop";

    fetch(`${endpoint}?adminUserId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (activeTab === "events") setEventItems(data.items);
          else setShopItems(data.items);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

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

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map((i) => i.id));
  };

  const handleDownloadCsv = () => {
    const rowsToExport =
      selectedIds.length > 0 ? items.filter((i) => selectedIds.includes(i.id)) : items;

    if (rowsToExport.length === 0) {
      alert("ไม่มีรายการให้ดาวน์โหลด");
      return;
    }

    const headers =
      activeTab === "events"
        ? [
            { key: "name", label: "ชื่อ-นามสกุล" },
            { key: "phone", label: "เบอร์โทร" },
            { key: "address", label: "ที่อยู่" },
            { key: "eventTitle", label: "กิจกรรม" },
            { key: "packageName", label: "แพ็กเกจ" },
            { key: "shirtSize", label: "ไซส์เสื้อ" },
          ]
        : [
            { key: "name", label: "ชื่อ-นามสกุล" },
            { key: "phone", label: "เบอร์โทร" },
            { key: "address", label: "ที่อยู่" },
            { key: "productName", label: "สินค้า" },
            { key: "size", label: "ไซส์" },
            { key: "quantity", label: "จำนวน" },
          ];

    const filename =
      (activeTab === "events" ? "shipping-events-" : "shipping-shop-") +
      new Date().toISOString().slice(0, 10) +
      ".csv";

    downloadCsv(filename, toCsv(rowsToExport, headers));
  };

  const handleMarkShipped = async () => {
    if (selectedIds.length === 0) {
      alert("กรุณาเลือกรายการก่อน");
      return;
    }
    if (!confirm(`ยืนยันว่าจัดส่ง ${selectedIds.length} รายการนี้แล้ว?`)) return;

    setMarking(true);

    try {
      const res = await fetch("/api/admin/shipping/mark-shipped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId: currentUser.id,
          type: activeTab === "events" ? "event" : "shop",
          ids: selectedIds,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "อัปเดตสถานะไม่สำเร็จ");
        return;
      }

      if (activeTab === "events") {
        setEventItems(eventItems.filter((i) => !selectedIds.includes(i.id)));
      } else {
        setShopItems(shopItems.filter((i) => !selectedIds.includes(i.id)));
      }
      setSelectedIds([]);
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setMarking(false);
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
        <h2 className="admin-title">รายงานจัดเตรียมจัดส่งสินค้า</h2>

        <div className="admin-tabs">
          <button
            className={"admin-tab" + (activeTab === "events" ? " admin-tab-active" : "")}
            onClick={() => setActiveTab("events")}
          >
            กิจกรรม
          </button>
          <button
            className={"admin-tab" + (activeTab === "shop" ? " admin-tab-active" : "")}
            onClick={() => setActiveTab("shop")}
          >
            ร้านค้า
          </button>
        </div>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : items.length === 0 ? (
          <p className="empty-text">ไม่มีรายการที่รอจัดส่ง</p>
        ) : (
          <>
            <div className="payment-actions admin-section-spacing">
              <button className="auth-secondary-btn" onClick={toggleSelectAll}>
                {selectedIds.length === items.length ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
              </button>
              <button className="auth-submit-btn" onClick={handleDownloadCsv}>
                ⬇️ ดาวน์โหลด CSV{selectedIds.length > 0 ? ` (${selectedIds.length} รายการ)` : " (ทั้งหมด)"}
              </button>
              <button className="pay-btn" onClick={handleMarkShipped} disabled={marking}>
                {marking ? "กำลังบันทึก..." : "✅ มาร์กว่าส่งแล้ว"}
              </button>
            </div>

            <div className="admin-list admin-section-spacing">
              {items.map((item) => (
                <div key={item.id} className="admin-item">
                  <div className="admin-info" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      style={{ marginTop: "4px" }}
                    />
                    <div>
                      <h4>
                        {item.name}
                        {activeTab === "events" && item.shirtSize
                          ? ` — ไซส์เสื้อ ${item.shirtSize}`
                          : ""}
                      </h4>
                      <p>{item.phone || "ไม่มีเบอร์โทร"}</p>
                      <p>{item.address || "ไม่มีที่อยู่"}</p>
                      <p>
                        {activeTab === "events"
                          ? `${item.eventTitle} — ${item.packageName}`
                          : `${item.productName}${item.size ? ` (ไซส์ ${item.size})` : ""} x${item.quantity}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AdminShipping;
