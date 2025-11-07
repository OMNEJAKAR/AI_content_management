import React from "react";

export default function AddSourceModal({ onSelectFolder, onClose }) {
  const handleFolderClick = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      await onSelectFolder(handle);
      onClose();
    } catch (err) {
      console.warn("User cancelled folder picker:", err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px 30px",
          borderRadius: "8px",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h3>Select a Folder</h3>
        <p style={{ marginBottom: "15px" }}>
          Please select a folder you want to connect as your local source.
        </p>
        <button
          onClick={handleFolderClick}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Allow Access
        </button>
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={onClose}
            style={{
              background: "#ccc",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
