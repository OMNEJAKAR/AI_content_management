import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ onLogout }) {
  // get role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>AI-CMO</h2>
        <nav style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <Link to="/">Dashboard</Link>
          <Link to="/library">Library</Link>
          <Link to="/sources">Sources</Link>

          {/* ✅ Only show Admin link for admin users */}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}

          <button
            onClick={onLogout}
            style={{
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
