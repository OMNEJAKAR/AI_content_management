import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllFolderHandles } from "../utils/fsStorage";
import { extractFileData } from "../utils/fileProcessor";

export default function LocalViewer() {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    const load = async () => {
      const currentUser = localStorage.getItem("authUser") || "guest";
      const sources =
        JSON.parse(localStorage.getItem(`localSources_${currentUser}`)) || [];
      const found = sources.find((f) => f.id === id);
      if (!found) return;
      const handles = await getAllFolderHandles();
      const match = handles.find((h) => h.id === id);
      const handle = match?.handle;
      if (!handle) return setFolder(found);
      const fileList = [];
      for await (const entry of handle.values()) {
        if (entry.kind === "file" && !entry.name.startsWith(".DS_Store")) {
          fileList.push(entry);
        }
      }
      setFolder(found);
      setFiles(fileList);
    };
    load();
  }, [id]);

  const openFile = async (entry) => {
    const data = await extractFileData(entry);
    if (!data) return;

    const file = await entry.getFile();
    const ext = (file.name && file.name.includes("."))
      ? file.name.split(".").pop().toLowerCase()
      : "";
    const blobUrl = URL.createObjectURL(file);

    let contentView = null;

    // ✅ Image preview
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
      contentView = (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={blobUrl}
            alt={file.name}
            style={{ maxWidth: "80%", borderRadius: "8px" }}
          />
        </div>
      );
    }

    // ✅ PDF preview
    else if (ext === "pdf") {
      const pdfBlob = new Blob([await file.arrayBuffer()], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      contentView = (
        <iframe
          src={pdfUrl}
          title={file.name}
          style={{
            width: "100%",
            height: "85vh",
            border: "none",
            borderRadius: "6px",
          }}
        />
      );
    }

    // ✅ Text-like files preview
    else if (["txt", "csv", "json", "md"].includes(ext)) {
      contentView = (
        <div
          style={{
            background: "#fff",
            padding: "20px",
            fontFamily: "monospace",
            borderRadius: "6px",
            whiteSpace: "pre-wrap",
            overflowY: "auto",
            maxHeight: "80vh",
          }}
        >
          {data.textSnippet || "No text extracted."}
        </div>
      );
    } else {
      contentView = <p>Preview not supported for this file type.</p>;
    }

    // ✅ Preview modal with metadata panel
    setPreview(
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          maxHeight: "90vh",
        }}
      >
        <div style={{ flex: 3, overflowY: "auto" }}>{contentView}</div>

        <div
          style={{
            flex: 1,
            background: "#f8f8f8",
            padding: "15px",
            borderRadius: "6px",
            overflowY: "auto",
            maxHeight: "85vh",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Metadata</h3>
          <p><b>Name:</b> {data.name}</p>
          <p><b>Type:</b> {data.type}</p>
          <p><b>Size:</b> {data.sizeKB} KB</p>
          <p><b>Created:</b> {data.created}</p>
          <p><b>Language:</b> {data.language}</p>

          {/* ✅ Extracted text section */}
          <div style={{ marginTop: "1rem" }}>
            <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Extracted Text</h4>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: showFullText ? "400px" : "200px",
                overflowY: "auto",
                background: "#fff",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
            >
              {data.textSnippet || "No text extracted."}
            </pre>
            {data.textSnippet && data.textSnippet.length > 300 && (
              <button
                onClick={() => setShowFullText((prev) => !prev)}
                style={{
                  marginTop: "8px",
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {showFullText ? "Show less ▲" : "View full text ▼"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!folder) return <p>Folder not found.</p>;

  return (
    <div>
      <h2>{folder.name}</h2>
      <div className="grid">
        {files.map((entry, i) => (
          <div
            key={i}
            className="card"
            onClick={() => openFile(entry)}
            style={{ cursor: "pointer" }}
          >
            <p>{entry.name}</p>
          </div>
        ))}
      </div>

      {/* ✅ Preview modal */}
      {preview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "95%",
              maxHeight: "95%",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {preview}
          </div>
        </div>
      )}
    </div>
  );
}
