import { useState, useEffect } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";

function formatDateDisplay(isoDate) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function Home({ onSelectEvent, onNavigate, currentUser, onLogout }) {
  const [search, setSearch] = useState("");
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
            date: formatDateDisplay(e.event_date),
            dateISO: e.event_date,
            endDate: formatDateDisplay(e.end_date),
            endDateISO: e.end_date,
            location: e.location,
            distance: e.distance,
            image: e.image,
            description: e.description,
          }));
          setEvents(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date();

  const ongoingEvents = filteredEvents.filter(
    (event) => new Date(event.endDateISO) >= today
  );

  const finishedEvents = filteredEvents.filter(
    (event) => new Date(event.endDateISO) < today
  );

  return (
    <>
      <Header onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <Hero />

      <SearchBar search={search} setSearch={setSearch} />

      <section className="event-section">
        <h2 className="section-title">🏃 กิจกรรมที่กำลังดำเนินการ</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : ongoingEvents.length === 0 ? (
          <p className="empty-text">ยังไม่มีกิจกรรมที่กำลังจะจัดขึ้น</p>
        ) : (
          <div className="grid">
            {ongoingEvents.map((event) => (
              <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
            ))}
          </div>
        )}
      </section>

      <section className="event-section">
        <h2 className="section-title">🏁 กิจกรรมที่จบไปแล้ว</h2>

        {loading ? (
          <p className="empty-text">กำลังโหลด...</p>
        ) : finishedEvents.length === 0 ? (
          <p className="empty-text">ยังไม่มีกิจกรรมที่จบไปแล้ว</p>
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
