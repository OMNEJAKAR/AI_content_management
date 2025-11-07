import React, { useState } from "react";

export default function Login({ onLogin, onSignup }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      onSignup(username.trim(), password.trim());
    } else {
      onLogin(username.trim(), password.trim());
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f4f6f8",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          width: "300px",
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          {isSignup ? "Create Account" : "AI-CMO Login"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              required
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* ✅ Toggle link */}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                style={{ color: "#007bff", background: "none", border: "none" }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                onClick={() => setIsSignup(true)}
                style={{ color: "#007bff", background: "none", border: "none" }}
              >
                Create Account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
