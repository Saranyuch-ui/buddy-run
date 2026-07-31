import { useState } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const goHome = () => {
    setSelectedEvent(null);
    setPage("home");
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setPage("detail");
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setPage(selectedEvent ? "detail" : "home");
  };

  if (page === "detail" && selectedEvent) {
    return (
      <Detail
        event={selectedEvent}
        onBack={goHome}
        onNavigate={setPage}
        isLoggedIn={isLoggedIn}
      />
    );
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
    return (
      <Login
        onNavigate={setPage}
        onLogoClick={goHome}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (page === "register") {
    return <Register onNavigate={setPage} onLogoClick={goHome} />;
  }

  if (page === "forgot-password") {
    return <ComingSoon title="ลืมรหัสผ่าน" onNavigate={setPage} onLogoClick={goHome} />;
  }

  return <Home onSelectEvent={handleSelectEvent} onNavigate={setPage} />;
}

export default App;
