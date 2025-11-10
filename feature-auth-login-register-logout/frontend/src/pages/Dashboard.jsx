import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteFolderHandle } from "../utils/fsStorage";
import { logAudit } from "../utils/audit";

export default function Dashboard() {
  const [sharedSpaces] = useState([]); // backend later
  const [localSources, setLocalSources] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("authUser") || "guest";
    const load = () => {
      const saved =
        JSON.parse(localStorage.getItem(`localSources_${currentUser}`)) || [];
      setLocalSources(saved);
    };

    load();
    const onChange = () => load();
    window.addEventListener("localSourcesChanged", onChange);
    return () => window.removeEventListener("localSourcesChanged", onChange);
  }, []);

  const removeLocalSource = async (id) => {
    const currentUser = localStorage.getItem("authUser") || "guest";
    const removed = localSources.find((s) => s.id === id);
    const updated = localSources.filter((s) => s.id !== id);
    setLocalSources(updated);
    localStorage.setItem(
      `localSources_${currentUser}`,
      JSON.stringify(updated)
    );
    try {
      await deleteFolderHandle(id);
    } catch (e) {
      console.warn("Failed to delete handle for", id, e);
    }
    window.dispatchEvent(new Event("localSourcesChanged"));
    logAudit("source_deleted", { id, name: removed?.name });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, Admin 👋</p>

      {/* Shared Spaces */}
      <section style={{ marginTop: "20px" }}>
        <h2>Shared Spaces (Cloud)</h2>
        {sharedSpaces.length === 0 ? (
          <p>No shared spaces yet (backend will populate this).</p>
        ) : (
          <div className="grid">
            {sharedSpaces.map((space) => (
              <div key={space.id} className="card">
                <h3>{space.name}</h3>
                <p>Members: {space.members || "None"}</p>
                <button>Open Space</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Local Sources */}
      <section style={{ marginTop: "30px" }}>
        <h2>Local Spaces</h2>
        {localSources.length === 0 ? (
          <p>No local folders yet. Add one in "Sources."</p>
        ) : (
          <div className="grid">
            {localSources.map((source) => {
  const visibleCount = Array.isArray(source.files) ? source.files.filter((f) => !f.startsWith(".DS_Store")).length
  : 0;
  return (
    <div key={source.id} className="card">
      <h3>{source.name}</h3>
      <p>Files: {visibleCount}</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <Link to={`/local/${source.id}`}>
          <button>Open</button>
        </Link>
        <button
          onClick={() => setConfirmDeleteId(source.id)}
          style={{
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
      {confirmDeleteId === source.id && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <p>
              Are you sure you want to delete <b>{source.name}</b>?
            </p>
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={async () => {
                  await removeLocalSource(source.id);
                  setConfirmDeleteId(null);
                }}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  marginLeft: "10px",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
})}

          </div>
        )}
      </section>
    </div>
  );
}
