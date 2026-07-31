function EventCard({ event, onSelect }) {
  return (
    <div className="card">

      <img
        src={event.image}
        alt={event.title}
      />

      <div className="card-body">

        <h3>{event.title}</h3>

        <p>📅 {event.date}</p>

        <p>📍 {event.location}</p>

        <p>🏃 {event.distance}</p>

        <button onClick={() => onSelect(event)}>
          View Detail
        </button>

      </div>

    </div>
  );
}

export default EventCard;
