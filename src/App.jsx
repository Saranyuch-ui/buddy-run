import { useState } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Detail from "./pages/Detail";

function ComingSoon({ title, onNavigate, onLogoClick }) {
  return (
    <>
      <Header onNavigate={onNavigate} onLogoClick={onLogoClick} />
      <div className="coming-soon">
        <h2>🚧 {title}</h2>
        <p>หน้านี้อยู่ระหว่างพัฒนา</p>
      </div>
    </>
  );
}

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [page, setPage] = useState("home");

  const goHome = () => {
    setSelectedEvent(null);
    setPage("home");
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setPage("detail");
  };

  if (page === "detail" && selectedEvent) {
    return <Detail event={selectedEvent} onBack={goHome} />;
  }

  if (page === "payment") {
    return <ComingSoon title="ชำระเงิน" onNavigate={setPage} onLogoClick={goHome} />;
  }

  if (page === "submit-result") {
    return <ComingSoon title="ส่งผลกิจกรรม" onNavigate={setPage} onLogoClick={goHome} />;
  }

  if (page === "contact") {
    return <ComingSoon title="ติดต่อเรา" onNavigate={setPage} onLogoClick={goHome} />;
  }

  if (page === "login") {
    return <ComingSoon title="Login" onNavigate={setPage} onLogoClick={goHome} />;
  }

  return <Home onSelectEvent={handleSelectEvent} onNavigate={setPage} />;
}

export default App;
