import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import Login from "./pages/auth/Login";
import PopupMessage from "./components/PopupMessage";
import { logAudit } from "./utils/audit";
 

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ✅ app start: keep existing sources and handles persistent
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);
  }, []);

  // ✅ Login handler
  const handleLogin = async (username, password) => {
    try {
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPopupMessage(data.message || "❌ Invalid credentials. Please try again.");
        return;
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("authUser", data.user.username);

      setPopupMessage(`👋 Welcome back, ${data.user.username}!`);
      setIsLoggedIn(true);
      logAudit("login", { username: data.user.username });
    } catch {
      setPopupMessage("⚠️ Login failed. Please check your connection.");
    }
  };

  // ✅ Signup handler
  const handleSignup = async (username, password) => {
    try {
      const res = await fetch("http://localhost:5050/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPopupMessage(data.message || "❌ Signup failed. Please try again.");
        return;
      }

      setPopupMessage("✅ Account created successfully! You can now log in.");
    } catch {
      setPopupMessage("⚠️ Signup failed. Please check your connection.");
    }
  };

  // ✅ Logout handler — clears everything
  const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "User";

    // Clean only auth data; keep local sources and file handles persistent
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("authUser");

    setPopupMessage(`👋 Logged out. Your sources remain available for next login, ${username}.`);
    setIsLoggedIn(false);
    logAudit("logout", { username });
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          <Navbar onLogout={handleLogout} />
          <main className="container">
            <AppRoutes />
          </main>
          <Footer />
        </>
      ) : (
        <Login onLogin={handleLogin} onSignup={handleSignup} />
      )}
      <PopupMessage
        message={popupMessage}
        onClose={() => setPopupMessage("")}
      />
    </div>
  );
}
