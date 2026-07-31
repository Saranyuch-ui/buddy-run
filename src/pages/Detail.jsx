function Detail({ event, onBack }) {
  if (!event) {
    return (
      <div className="detail">
        <p>ไม่พบข้อมูลกิจกรรม</p>
        <button onClick={onBack}>← Back</button>
      </div>
    );
  }

  return (
    <div className="detail">
      <button onClick={onBack}>← Back</button>

      <img src={event.image} alt={event.title} />

      <h2>{event.title}</h2>

      <p>📅 {event.date}</p>
      <p>📍 {event.location}</p>
      <p>🏃 {event.distance}</p>
      <p>{event.description}</p>
    </div>
  );
}

export default Detail;
