import { useState } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";

function ComingSoon({ title, onNavigate, onLogoClick, currentUser, onLogout }) {
  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogoClick={onLogoClick}
        currentUser={currentUser}
        onLogout={onLogout}
      />
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
  const [currentUser, setCurrentUser] = useState(null);

  const isLoggedIn = !!currentUser;

  const goHome = () => {
    setSelectedEvent(null);
    setPage("home");
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setPage("detail");
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setPage(selectedEvent ? "detail" : "home");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    goHome();
  };

  if (page === "detail" && selectedEvent) {
    return (
      <Detail
        event={selectedEvent}
        onBack={goHome}
        onNavigate={setPage}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "profile") {
    return (
      <Profile
        onNavigate={setPage}
        onLogoClick={goHome}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "payment") {
    return (
      <Payment
        onNavigate={setPage}
        onLogoClick={goHome}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "submit-result") {
    return (
      <ComingSoon
        title="ส่งผลกิจกรรม"
        onNavigate={setPage}
        onLogoClick={goHome}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "contact") {
    return (
      <ComingSoon
        title="ติดต่อเรา"
        onNavigate={setPage}
        onLogoClick={goHome}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "admin") {
    return (
      <Admin
        onNavigate={setPage}
        onLogoClick={goHome}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
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
    return (
      <ComingSoon
        title="ลืมรหัสผ่าน"
        onNavigate={setPage}
        onLogoClick={goHome}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Home
      onSelectEvent={handleSelectEvent}
      onNavigate={setPage}
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
}

export default App;
