function EventCard({ event, onSelect, disabled }) {
  return (
    <div className={"card" + (disabled ? " card-disabled" : "")}>

      <img
        src={event.image}
        alt={event.title}
      />

      <div className="card-body">

        <h3>{event.title}</h3>

        <p>📅 เริ่ม: {event.date}</p>

        <p>🏁 สิ้นสุด: {event.endDate}</p>

        {event.location && <p>📍 {event.location}</p>}

        <p>🏃 {event.distance}</p>

        <button
          onClick={() => !disabled && onSelect(event)}
          disabled={disabled}
        >
          {disabled ? "กิจกรรมสิ้นสุดแล้ว" : "View Detail"}
        </button>

      </div>

    </div>
  );
}

export default EventCard;
