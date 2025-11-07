import React from "react";

export default function PopupMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px 30px",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "300px",
        }}
      >
        <p style={{ marginBottom: "20px", fontSize: "16px" }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
