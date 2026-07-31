import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";

import events from "../data/events";

function Home({ onSelectEvent, onNavigate }) {

  const [search, setSearch] = useState("");

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date();

  const ongoingEvents = filteredEvents.filter(
    (event) => new Date(event.dateISO) >= today
  );

  const finishedEvents = filteredEvents.filter(
    (event) => new Date(event.dateISO) < today
  );

  return (
    <>

      <Header onNavigate={onNavigate} />

      <Hero />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <section className="event-section">
        <h2 className="section-title">🏃 กิจกรรมที่กำลังดำเนินการ</h2>

        {ongoingEvents.length === 0 ? (
          <p className="empty-text">ยังไม่มีกิจกรรมที่กำลังจะจัดขึ้น</p>
        ) : (
          <div className="grid">
            {ongoingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        )}
      </section>

      <section className="event-section">
        <h2 className="section-title">🏁 กิจกรรมที่จบไปแล้ว</h2>

        {finishedEvents.length === 0 ? (
          <p className="empty-text">ยังไม่มีกิจกรรมที่จบไปแล้ว</p>
        ) : (
          <div className="grid">
            {finishedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />

    </>
  );
}

export default Home;
