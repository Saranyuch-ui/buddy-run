import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";

import events from "../data/events";

function Home() {

  const [search, setSearch] = useState("");

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>

      <Header />

      <Hero />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <div className="grid">

        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
          />
        ))}

      </div>

      <Footer />

    </>
  );
}

export default Home;
