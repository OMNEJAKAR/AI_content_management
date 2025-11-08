import React from "react";

export default function Dashboard({ user }) {
  const username = user?.username || JSON.parse(localStorage.getItem("user") || "null")?.username || "User";

  return (
    <div data-testid="dashboard-page" style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {username}!</p>

      <section style={{ marginTop: 16 }}>
        <h2>Quick Actions</h2>
        <ul>
          <li>View library</li>
          <li>Manage sources</li>
          <li>Account settings</li>
        </ul>
      </section>
    </div>
  );
}
