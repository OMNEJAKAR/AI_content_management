import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Library from "../pages/Library";
import DocumentViewer from "../pages/DocumentViewer";
import Sources from "../pages/Sources";
import AdminConsole from "../pages/AdminConsole";
import LocalViewer from "../pages/LocalViewer"; // 🆕

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/library" element={<Library />} />
      <Route path="/document/:id" element={<DocumentViewer />} />
      <Route path="/sources" element={<Sources />} />
      <Route path="/local/:id" element={<LocalViewer />} /> {/* 🆕 */}
      <Route path="/admin" element={<AdminConsole />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
