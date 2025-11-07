import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to AI-CMO</h1>
      <p>An AI-powered content management and organization tool.</p>
      <Link to="/library">
        <button style={{ padding: "10px 20px", marginTop: "20px" }}>Go to Library</button>
      </Link>
    </div>
  );
}
