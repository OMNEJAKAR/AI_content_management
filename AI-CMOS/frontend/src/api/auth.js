// API URL configuration
// In tests: uses globalThis.__TEST_API_URL__ set in setupTests.js
// In Vite: uses import.meta.env.VITE_API_URL (replaced at build time by Vite)
// Fallback: process.env.VITE_API_URL or default localhost URL

// Use eval to avoid Babel parsing issues with import.meta in tests
const getViteEnv = () => {
  try {
    // eslint-disable-next-line no-eval
    return eval('import.meta.env');
  } catch {
    return null;
  }
};

const API_URL = 
  (typeof globalThis !== "undefined" && globalThis.__TEST_API_URL__) ||
  (getViteEnv()?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env.VITE_API_URL) ||
  "http://localhost:5050";

export async function signup(username, password) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Signup failed");
  }

  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Logout failed");
  }

  return res.json();
}
