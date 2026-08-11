import { useState, useEffect } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";

function formatDateDisplay(isoDate) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function Home({ onSelectEvent, onNavigate, currentUser, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.events.map((e) => ({
            id: e.id,
            title: e.title,
            image: e.image,
            challenge: e.description,
            location: e.location,
            distance: e.distance,
            regStart: formatDateDisplay(e.reg_start_date),
            regStartISO: e.reg_start_date,
            regEnd: formatDateDisplay(e.reg_end_date),
            regEndISO: e.reg_end_date,
            resultStart: formatDateDisplay(e.result_start_date),
            resultStartISO: e.result_start_date,
            resultEnd: formatDateDisplay(e.result_end_date),
            resultEndISO: e.result_end_date,
          }));
          setEvents(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date();

  const ongoingEvents = events.filter(
    (event) => event.regEndISO && new Date(event.regEndISO) >= today
  );

  const finishedEvents = events.filter(
    (event) => !event.regEndISO || new Date(event.regEndISO) < today
  );

  return (
    <>
      <Header onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <Hero />

      <section className="event-section">
        <h2 className="section-title">🏃 กิจกรรมที่เปิดรับสมัคร</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : ongoingEvents.length === 0 ? (
          <p className="empty-text">ยังไม่มีกิจกรรมที่เปิดรับสมัคร</p>
        ) : (
          <div className="grid">
            {ongoingEvents.map((event) => (
              <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
            ))}
          </div>
        )}
      </section>

      <section className="event-section">
        <h2 className="section-title">🏁 หมดเขตรับสมัครแล้ว</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : finishedEvents.length === 0 ? (
          <p className="empty-text">ยังไม่มีกิจกรรมที่หมดเขต</p>
        ) : (
          <div className="grid">
            {finishedEvents.map((event) => (
              <EventCard key={event.id} event={event} onSelect={onSelectEvent} disabled={true} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}

export default Home;
