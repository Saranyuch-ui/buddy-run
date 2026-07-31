import { useState } from "react";
import Home from "./pages/Home";
import Detail from "./pages/Detail";

function ComingSoon({ title }) {
  return (
    <div className="coming-soon">
      <h2>🚧 {title}</h2>
      <p>หน้านี้อยู่ระหว่างพัฒนา</p>
    </div>
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
    return <ComingSoonPage title="ชำระเงิน" onNavigate={setPage} onLogoClick={goHome} />;
  }

  if (page === "submit-result") {
    return <ComingSoonPage title="ส่งผลกิจกรรม" onNavigate={setPage} onLogoClick={goHome} />;
  }

  if (page === "contact") {
    return <ComingSoonPage title="ติดต่อเรา" onNavigate={setPage} onLogoClick={goHome} />;
  }

  if (page === "login") {
    return <ComingSoonPage title="Login" onNavigate={setPage} onLogoClick={goHome} />;
  }

  return <Home onSelectEvent={handleSelectEvent} onNavigate={setPage} />;
}

function ComingSoonPage({ title, onNavigate, onLogoClick }) {
  return (
    <>
      <HeaderWithProps onNavigate={onNavigate} onLogoClick={onLogoClick} />
      <ComingSoon title={title} />
    </>
  );
}

import Header from "./components/Header";
function HeaderWithProps(props) {
  return <Header {...props} />;
}

export default App;
