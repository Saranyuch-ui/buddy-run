import { useState, useEffect } from "react";
import Header from "../components/Header";

const MONTH_LABELS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AdminDashboard({ onNavigate, onLogoClick, currentUser, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) return;

    setLoading(true);
    setError("");
    fetch(`/api/admin/dashboard?adminUserId=${currentUser.id}&period=${period}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        } else {
          setError(res.error || "โหลดข้อมูลไม่สำเร็จ");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
      });
  }, [currentUser, period]);

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

  if (loading) {
    return (
      <>
        <Header
          onNavigate={onNavigate}
          onLogoClick={onLogoClick}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="dashboard-page">
          <p className="empty-text">กำลังโหลด...</p>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header
          onNavigate={onNavigate}
          onLogoClick={onLogoClick}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="dashboard-page">
          <p className="empty-text">⚠️ {error || "ไม่สามารถโหลดข้อมูลได้"}</p>
        </div>
      </>
    );
  }

  const maxWeekly = Math.max(1, ...data.weeklySignups.map((d) => d.c));
  const maxMonthlyRevenue = Math.max(1, ...data.monthlyRevenue.map((d) => d.s || 0));

  const monthlyMap = {};
  data.monthlyRevenue.forEach((d) => {
    monthlyMap[d.m] = d.s || 0;
  });
  const monthlyFull = MONTH_LABELS.map((label, i) => {
    const key = String(i + 1).padStart(2, "0");
    return { label, amount: monthlyMap[key] || 0 };
  }).filter((m) => m.amount > 0);

  const { paid, pending, rejected } = data.paymentSummary;
  const total = paid + pending + rejected || 1;
  const paidPct = (paid / total) * 100;
  const pendingPct = (pending / total) * 100;
  const rejectedPct = (rejected / total) * 100;
  const pieGradient = `conic-gradient(#16a34a 0% ${paidPct}%, #f59e0b ${paidPct}% ${paidPct + pendingPct}%, #dc2626 ${paidPct + pendingPct}% 100%)`;

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="dashboard-page">
        <h2 className="admin-title">Dashboard</h2>

        <div className="dash-cards">
          <div className="dash-card">
            <p className="dash-card-label">สมาชิกทั้งหมด</p>
            <p className="dash-card-value">{data.totalMembers.toLocaleString()}</p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">กิจกรรมที่เปิด</p>
            <p className="dash-card-value">{data.activeEvents.toLocaleString()}</p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">สมัครวันนี้</p>
            <p className="dash-card-value">{data.todaySignups.toLocaleString()}</p>
          </div>
          <div className="dash-card">
            <div className="dash-card-header-row">
              <p className="dash-card-label">รายได้</p>
              <select
                className="dash-period-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">วันนี้</option>
                <option value="month">เดือนนี้</option>
              </select>
            </div>
            <p className="dash-card-value">฿{data.revenue.toLocaleString()}</p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">รอชำระเงิน</p>
            <p className="dash-card-value">{data.pendingPayment.toLocaleString()}</p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">รอตรวจสอบสลิป</p>
            <p className="dash-card-value">{data.pendingSlip.toLocaleString()}</p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">รอตรวจสอบผลวิ่ง</p>
            <p className="dash-card-value">{data.pendingResult.toLocaleString()}</p>
          </div>
        </div>

        <div className="dash-row">
          <div className="dash-chart-card">
            <h3>จำนวนผู้สมัครย้อนหลัง (7 วัน)</h3>
            <div className="bar-chart">
              {data.weeklySignups.map((d) => {
                const date = new Date(d.d);
                const label = WEEKDAY_LABELS[date.getDay()];
                return (
                  <div key={d.d} className="bar-col">
                    <div className="bar-value">{d.c}</div>
                    <div
                      className="bar"
                      style={{ height: `${(d.c / maxWeekly) * 100}%` }}
                    ></div>
                    <div className="bar-label">{label}</div>
                  </div>
                );
              })}
              {data.weeklySignups.length === 0 && (
                <p className="empty-text">ยังไม่มีข้อมูล</p>
              )}
            </div>
          </div>

          <div className="dash-chart-card">
            <h3>รายได้รายเดือน (ปีนี้)</h3>
            <div className="bar-chart">
              {monthlyFull.map((m) => (
                <div key={m.label} className="bar-col">
                  <div className="bar-value">฿{m.amount.toLocaleString()}</div>
                  <div
                    className="bar bar-revenue"
                    style={{ height: `${(m.amount / maxMonthlyRevenue) * 100}%` }}
                  ></div>
                  <div className="bar-label">{m.label}</div>
                </div>
              ))}
              {monthlyFull.length === 0 && (
                <p className="empty-text">ยังไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        </div>

        <div className="dash-row">
          <div className="dash-chart-card">
            <h3>Pending Action — สิ่งที่ Admin ต้องทำวันนี้</h3>
            <div className="pending-action-list">
              <div className="pending-action-item">
                <span>ตรวจสอบสลิป</span>
                <span className="pending-action-count">{data.pendingSlip}</span>
              </div>
              <div className="pending-action-item">
                <span>ตรวจผลกิจกรรม</span>
                <span className="pending-action-count">{data.pendingResult}</span>
              </div>
            </div>
          </div>

          <div className="dash-chart-card">
            <h3>สมาชิกใหม่</h3>
            <div className="mini-stat-row">
              <div className="mini-stat">
                <p className="mini-stat-label">วันนี้</p>
                <p className="mini-stat-value">{data.newMembers.today}</p>
              </div>
              <div className="mini-stat">
                <p className="mini-stat-label">สัปดาห์นี้</p>
                <p className="mini-stat-value">{data.newMembers.week}</p>
              </div>
              <div className="mini-stat">
                <p className="mini-stat-label">เดือนนี้</p>
                <p className="mini-stat-value">{data.newMembers.month}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-chart-card">
          <h3>Active Events — ดูภาพรวมของแต่ละกิจกรรม</h3>
          {data.activeEventsList.length === 0 ? (
            <p className="empty-text">ไม่มีกิจกรรมที่เปิดอยู่</p>
          ) : (
            <div className="event-overview-list">
              {data.activeEventsList.map((ev) => (
                <div key={ev.id} className="event-overview-item">
                  <h4>{ev.title}</h4>
                  <div className="event-overview-stats">
                    <span>สมัคร {ev.signups} คน</span>
                    <span>Paid {ev.paid} คน</span>
                    <span>Result {ev.result} คน</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-chart-card">
          <h3>Payment Summary</h3>
          <div className="pie-row">
            <div className="pie-chart" style={{ background: pieGradient }}></div>
            <div className="pie-legend">
              <div className="pie-legend-item">
                <span className="pie-dot pie-dot-paid"></span> Paid: {paid}
              </div>
              <div className="pie-legend-item">
                <span className="pie-dot pie-dot-pending"></span> Pending: {pending}
              </div>
              <div className="pie-legend-item">
                <span className="pie-dot pie-dot-rejected"></span> Rejected: {rejected}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
