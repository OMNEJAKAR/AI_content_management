import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import AppRoutes from "./routes/AppRoutes";
import { login, signup, logout as logoutApi } from "./api/auth";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Check for existing session on app start
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Login handler
  const handleLogin = async (username, password) => {
    try {
      setErrorMessage("");
      const data = await login(username, password);

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsLoggedIn(true);
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
      throw error;
    }
  };

  // Signup handler
  const handleSignup = async (username, password) => {
    try {
      setErrorMessage("");
      await signup(username, password);
      setErrorMessage("");
      // After successful signup, switch to login mode
      // In a real app, you might auto-login the user
    } catch (error) {
      setErrorMessage(error.message || "Signup failed. Please try again.");
      throw error;
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API fails
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsLoggedIn(false);
      setErrorMessage("");
    }
  };

  return (
    <BrowserRouter>
      <div data-testid="app">
        {isLoggedIn ? (
          <>
            <Navbar onLogout={handleLogout} user={user} />
            <main className="container">
              <AppRoutes user={user} />
            </main>
          </>
        ) : (
          <Login
            onLogin={handleLogin}
            onSignup={handleSignup}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </BrowserRouter>
  );
}
