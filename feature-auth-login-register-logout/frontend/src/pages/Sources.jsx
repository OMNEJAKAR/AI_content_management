import React, { useState, useEffect } from "react";
import {
  saveFolderHandle,
  getAllFolderHandles,
  deleteFolderHandle,
} from "../utils/fsStorage";
import AddSourceModal from "../components/AddSourceModal";
import { logAudit } from "../utils/audit";

export default function Sources() {
  const [localSources, setLocalSources] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
<<<<<<< HEAD
  const [popupMessage, setPopupMessage] = useState("");
=======
>>>>>>> 699b53f6bdb99de7fdb6824de5da65c4d7809dea

  // ✅ Identify current logged-in user
  const currentUser = localStorage.getItem("authUser") || "guest";

  // ✅ Load saved folders for current user
  useEffect(() => {
    const load = async () => {
      const saved =
        JSON.parse(localStorage.getItem(`localSources_${currentUser}`)) || [];

      const handles = await getAllFolderHandles(); // returns handles for current user
      const merged = saved.map((src) => {
        const found = handles.find((h) => h.id === src.id);
        return {
          ...src,
          handle: found ? found.handle : null,
          connected: !!found,
        };
      });

      setLocalSources(merged);
    };
    load();
  }, [currentUser, refreshTrigger]);

  // ✅ Add folder for this specific user
  const handleSelectFolder = async (folderHandle) => {
    try {
      const id = folderHandle.name + "_" + Date.now();
      const files = [];

      for await (const entry of folderHandle.values()) {
        if (entry.kind === "file" && !entry.name.startsWith(".DS_Store")) {
          files.push(entry.name);
        }
      }

      const newSource = {
        id,
        name: folderHandle.name,
        files,
        connected: true,
      };

      const updated = [...localSources, newSource];
      setLocalSources(updated);

      // ✅ Save in per-user storage
      localStorage.setItem(
        `localSources_${currentUser}`,
        JSON.stringify(updated)
      );

      await saveFolderHandle(id, folderHandle);
      window.dispatchEvent(new Event("localSourcesChanged"));
      logAudit("source_added", { id, name: folderHandle.name, filesCount: files.length });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error selecting folder:", err);
      setShowAddModal(false);
    }
  };

  // ✅ Delete folder only for this user
  const removeLocalSource = async (id) => {
    const updated = localSources.filter((s) => s.id !== id);
    setLocalSources(updated);
    localStorage.setItem(
      `localSources_${currentUser}`,
      JSON.stringify(updated)
    );
    await deleteFolderHandle(id);
    window.dispatchEvent(new Event("localSourcesChanged"));
    const removed = localSources.find((s) => s.id === id);
    logAudit("source_deleted", { id, name: removed?.name });
    setConfirmDeleteId(null);
  };

  // ✅ Try reconnecting a disconnected folder
  const reconnectFolder = async (src) => {
    try {
      const handle = await window.showDirectoryPicker();
      if (handle.name !== src.name) {
<<<<<<< HEAD
        alert("Selected folder name doesn't match. Please pick the same folder.");
=======
        alert("Selected folder name doesn’t match. Please pick the same folder.");
>>>>>>> 699b53f6bdb99de7fdb6824de5da65c4d7809dea
        return;
      }

      await saveFolderHandle(src.id, handle);
      setPopupMessage(`✅ Reconnected ${src.name}`);
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      if (err.name !== "AbortError") console.error("Reconnect failed:", err);
    }
  };

  return (
    <div>
      <h2>Sources</h2>
      <p>
        Manage your local and cloud data sources here.
        <br />
        <small>
          (Current user: <b>{currentUser}</b>)
        </small>
      </p>

      {/* Local Sources */}
      <div
        className="card"
        style={{ marginBottom: "20px", padding: "20px", borderRadius: "8px" }}
      >
        <h3>Local Source</h3>
        <p>Add folders from your computer as data sources.</p>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          + Add Local Source
        </button>

        {showAddModal && (
          <AddSourceModal
            onSelectFolder={handleSelectFolder}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {localSources.length > 0 && (
          <ul style={{ marginTop: "15px", listStyle: "none", padding: 0 }}>
            {localSources.map((src) => {
              const fileCount = Array.isArray(src.files)
                ? src.files.filter((f) => !f.startsWith(".DS_Store")).length
                : 0;

              return (
                <li
                  key={src.id}
                  style={{
                    marginBottom: "10px",
                    background: "#f8f8f8",
                    padding: "10px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    📁 <b>{src.name}</b>{" "}
                    {src.connected ? (
                      <span style={{ color: "green" }}>(connected)</span>
                    ) : (
                      <span style={{ color: "red" }}>(disconnected)</span>
                    )}
                    {"  "}
                    ({fileCount} files)
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {!src.connected && (
                      <button
                        onClick={() => reconnectFolder(src)}
                        style={{
                          background: "#ffc107",
                          color: "black",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          padding: "5px 10px",
                        }}
                      >
                        Reconnect
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDeleteId(src.id)}
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        padding: "5px 10px",
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Confirm delete modal */}
                  {confirmDeleteId === src.id && (
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
                          Are you sure you want to delete <b>{src.name}</b>?
                        </p>
                        <div style={{ marginTop: "10px" }}>
                          <button
                            onClick={() => removeLocalSource(src.id)}
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
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Cloud Source placeholder */}
      <div className="card" style={{ padding: "20px", borderRadius: "8px" }}>
        <h3>Create Cloud Source</h3>
        <p>
          Connect to Google Drive or your hosted MongoDB cloud workspace
          (feature coming soon).
        </p>
        <button
          disabled
          style={{
            background: "#ccc",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "not-allowed",
          }}
        >
          Connect Cloud Source
        </button>
      </div>

      {/* Join Cloud Source placeholder */}
      <div
        className="card"
        style={{ padding: "20px", marginTop: "20px", borderRadius: "8px" }}
      >
        <h3>Join Cloud Source</h3>
        <p>
          Join an existing shared workspace using an invite link (feature coming
          soon).
        </p>
        <button
          disabled
          style={{
            background: "#ccc",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "not-allowed",
          }}
        >
          Join Cloud Source
        </button>
      </div>
    </div>
  );
}
