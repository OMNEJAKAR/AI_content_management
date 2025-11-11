import React from "react";
import { useParams } from "react-router-dom";

export default function DocumentViewer() {
  const { id } = useParams();

  return (
    <div>
      <h2>Document Viewer</h2>
      <p>Document ID: {id}</p>

      <div className="card" style={{ height: "400px", overflow: "auto" }}>
        <p><b>Document Content Placeholder</b></p>
        <p>This is where your AI-processed content or extracted text will be displayed.</p>
      </div>
    </div>
  );
}
