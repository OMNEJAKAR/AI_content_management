import React, { useState, useEffect } from "react";
import { getAllFolderHandles } from "../utils/fsStorage";
import { extractFileData } from "../utils/fileProcessor";
import { findDuplicates, hammingDistance } from "../utils/duplicate";

export default function Library() {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");

  useEffect(() => {
  let stop = false;

  const load = async () => {
    try {
      const currentUser = localStorage.getItem("authUser") || "guest";
      const savedSources = JSON.parse(localStorage.getItem(`localSources_${currentUser}`)) || [];
      const allowedIds = new Set(savedSources.map((s) => s.id));
      const handles = (await getAllFolderHandles()).filter((h) => allowedIds.has(h.id));
      const results = [];

      if (!handles.length || savedSources.length === 0) {
        console.warn("No saved folders — please add again.");
        setFiles([]); // Clear view
        return;
      }

      for (const { handle } of handles) {
        try {
          for await (const entry of handle.values()) {
            if (entry.kind === "file" && !entry.name.startsWith(".DS_Store")) {
              const info = await extractFileData(entry);
              if (info) results.push(info);
            }
          }
        } catch (err) {
          console.warn("Folder not found or inaccessible:", handle.name, err);
        }
      }

      // After collecting all file data, run duplicate detection across the set
      try {
        const augmented = results.map((file) => ({ ...file }));
        for (let i = 0; i < augmented.length; i++) {
          const file = augmented[i];
          const others = augmented.filter((_, idx) => idx !== i);
          const dup = findDuplicates(others, file.fingerprint, 3);
          file.isExactDuplicate = dup.exact.length > 0;
          file.duplicateOf = dup.exact.length > 0 ? dup.exact[0].name : null;
          file.nearDuplicates = dup.near.map((d) => ({ 
            name: d.name,
            similarity: `${((1 - hammingDistance(file.fingerprint.simhash, d.fingerprint.simhash) / 64) * 100).toFixed(1)}%`
          }));
        }
        if (!stop) setFiles(augmented);
      } catch (e) {
        console.warn("Duplicate detection failed:", e);
        if (!stop) setFiles(results);
      }
    } catch (error) {
      console.error("Error while loading folders:", error);
    }
  };

  load();

  // ✅ Listen for updates (if user adds/removes folders)
  const onChange = () => load();
  window.addEventListener("localSourcesChanged", onChange);

  return () => {
    stop = true;
    window.removeEventListener("localSourcesChanged", onChange);
  };
}, []);


  const filtered = files.filter((f) => {
    const q = query.toLowerCase();
    const matchesText =
      f.name.toLowerCase().includes(q) ||
      f.textSnippet.toLowerCase().includes(q);
    const matchesType = typeFilter === "all" || f.type.includes(typeFilter);
    const matchesLang =
      langFilter === "all" ||
      f.language.toLowerCase().includes(langFilter.toLowerCase());
    return matchesText && matchesType && matchesLang;
  });

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Main area */}
      <div style={{ flex: 3 }}>
        <h1>Library</h1>
        <input
          placeholder="Search by file name or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <p>{filtered.length} matching files</p>
        <div className="grid">
          {filtered.map((file, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{file.name}</h3>
              </div>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {file.isExactDuplicate && file.duplicateOf && (
                  <div style={{ 
                    background: '#ffdddd', 
                    color: '#900', 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <span style={{ fontWeight: 'bold' }}>Exact duplicate of:</span> {file.duplicateOf}
                  </div>
                )}
                {file.nearDuplicates && file.nearDuplicates.length > 0 && (
                  <div style={{ 
                    background: '#fff6df', 
                    color: '#665200', 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <span style={{ fontWeight: 'bold' }}>Similar to:</span>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {file.nearDuplicates.map((n, i) => (
                        <li key={i}>{n.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <p>Type: {file.type}</p>
                <p>Language: {file.language}</p>
                <p
                  style={{
                      whiteSpace: "pre-wrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxHeight: "4.5em", // roughly 3 lines
                  }}
                  >
                      {file.textSnippet}
                  </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar filters */}
      <div
        style={{
          flex: 1,
          background: "#f8f8f8",
          padding: "10px",
          borderRadius: "6px",
          height: "fit-content",
        }}
      >
        <h3>Filters</h3>
        <div>
          <b>File Type:</b>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: "100%", marginTop: "5px" }}
          >
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="pdf">PDF</option>
            <option value="text">Text</option>
          </select>
        </div>
        <div style={{ marginTop: "15px" }}>
          <b>Language:</b>
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            style={{ width: "100%", marginTop: "5px" }}
          >
            <option value="all">All</option>
            <option value="eng">English</option>
            <option value="fra">French</option>
            <option value="spa">Spanish</option>
            <option value="deu">German</option>
          </select>
        </div>
      </div>
    </div>
  );
}
