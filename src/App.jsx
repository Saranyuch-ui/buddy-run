import { useState } from "react";
import Home from "./pages/Home";
import Detail from "./pages/Detail";

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (selectedEvent) {
    return (
      <Detail
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return <Home onSelectEvent={setSelectedEvent} />;
}

export default App;
