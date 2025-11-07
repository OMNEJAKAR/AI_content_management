import React, { useState } from "react";

export default function Login({ onLogin, onSignup, errorMessage }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        await onSignup(username.trim(), password.trim());
      } else {
        await onLogin(username.trim(), password.trim());
      }
      // Reset form on success
      setUsername("");
      setPassword("");
    } catch (error) {
      // Error handling is done in parent component
      // Error is already logged/handled by the parent component
    } finally {
      setIsLoading(false);
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
      data-testid="login-page"
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

        {errorMessage && (
          <div
            style={{
              background: "#fee",
              color: "#c33",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              textAlign: "center",
            }}
            data-testid="error-message"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              required
              minLength={3}
              data-testid="username-input"
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              required
              minLength={6}
              data-testid="password-input"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px",
              background: isLoading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            data-testid="submit-button"
          >
            {isLoading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignup(false);
                  setUsername("");
                  setPassword("");
                }}
                style={{ color: "#007bff", background: "none", border: "none", cursor: "pointer" }}
                data-testid="toggle-to-login"
              >
                Login
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                onClick={() => {
                  setIsSignup(true);
                  setUsername("");
                  setPassword("");
                }}
                style={{ color: "#007bff", background: "none", border: "none", cursor: "pointer" }}
                data-testid="toggle-to-signup"
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
