import React, { useEffect, useState } from "react";

export default function Sources() {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null")?.username || "guest";
      const saved = JSON.parse(localStorage.getItem(`localSources_${currentUser}`)) || [];
      setSources(saved);
    } catch (e) {
      setSources([]);
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Sources</h2>
      <p>Manage your data sources (local placeholders).</p>

      {sources.length === 0 ? (
        <p>No local sources found for this user.</p>
      ) : (
        <ul>
          {sources.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
