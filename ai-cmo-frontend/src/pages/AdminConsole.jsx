import React, { useEffect, useState } from "react";
import { getAudit } from "../utils/audit";

export default function AdminConsole() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = () => setEvents(getAudit().slice().reverse());
    load();
    const onChange = () => load();
    window.addEventListener("auditLogChanged", onChange);
    return () => window.removeEventListener("auditLogChanged", onChange);
  }, []);

  const pretty = (e) => {
    switch (e.type) {
      case "login":
        return `User ${e.data?.username || e.user} logged in`;
      case "logout":
        return `User ${e.data?.username || e.user} logged out`;
      case "source_added":
        return `Added source "+${e.data?.name}+" (${e.data?.filesCount || 0} files)`;
      case "source_deleted":
        return `Deleted source "+${e.data?.name}+"`;
      default:
        return e.type;
    }
  };

  return (
    <div>
      <h2>Admin Console</h2>

      <div className="grid" style={{ marginTop: "10px" }}>
        <div className="card">
          <h4>Activity</h4>
          {events.length === 0 ? (
            <p>No activity yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 320, overflow: "auto" }}>
              {events.map((e) => (
                <li key={e.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                  <div style={{ fontSize: 14 }}>
                    <b>{pretty(e)}</b>
                  </div>
                  <div style={{ color: "#666", fontSize: 12 }}>
                    {new Date(e.at).toLocaleString()} — by {e.user}
                  </div>
                </li>) )}
            </ul>
          )}
        </div>

        <div className="card">
          <h4>Quick Stats</h4>
          <p>Total events: {events.length}</p>
          <p>Unique users: {[...new Set(events.map((e) => e.user))].length}</p>
        </div>
      </div>
    </div>
  );
}
