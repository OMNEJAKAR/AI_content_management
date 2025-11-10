import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAllFolderHandles } from '../utils/fsStorage';
import { extractFileData } from '../utils/fileProcessor.jsx';

export default function LocalViewer() {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Get current user and sources
        const currentUser = localStorage.getItem('authUser') || 'guest';
        const sourcesStr = localStorage.getItem(`localSources_${currentUser}`);
        if (!sourcesStr) {
          setError('No sources found. Please add a folder first.');
          return;
        }

        const sources = JSON.parse(sourcesStr);
        const found = sources.find((f) => f.id === id);
        if (!found) {
          setError('Folder not found in sources.');
          return;
        }

        // Get folder handle
        const handles = await getAllFolderHandles();
        const match = handles?.find((h) => h.id === id);
        const handle = match?.handle;
        
        if (!handle) {
          setError('Folder access lost. Please reconnect the folder.');
          return;
        }

        // Request permission if needed
        const permissionResult = await handle.requestPermission({ mode: 'read' });
        if (permissionResult !== 'granted') {
          setError('Permission denied. Please grant folder access.');
          return;
        }

        // Read files
        const fileList = [];
        try {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              try {
                // Verify each file is accessible
                await entry.getFile();
                fileList.push(entry);
              } catch (e) {
                console.warn(`Skipping inaccessible file: ${entry.name}`, e);
              }
            }
          }
        } catch (e) {
          setError('Error reading folder contents. Please try reconnecting the folder.');
          return;
        }

        if (fileList.length === 0) {
          setError('No accessible files found in the folder.');
          return;
        }

        setFolder(found);
        setFiles(fileList);
      } catch (error) {
        console.error('Load error:', error);
        setFolder(null);
      }
    };
    load();
  }, [id]);

  const handleFileClick = async (entry) => {
    const file = await entry.getFile();
    const data = await extractFileData(entry);
    setMetadata(data);
    setSelected(file);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setMetadata(null);
  };

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!folder) return <p>Folder not found. Please make sure you have selected a folder and granted permission.</p>;
  if (files.length === 0) return (
    <div>
      <h2>{folder.name}</h2>
      <p>No files found in this folder. Please make sure:</p>
      <ul className="list-disc pl-5 mt-2">
        <li>The folder is not empty</li>
        <li>You have granted permission to access the folder</li>
        <li>Try disconnecting and reconnecting the folder in Sources</li>
      </ul>
    </div>
  );

  return (
    <div>
      <h2>{folder.name}</h2>
      <div className="grid">
        {files.map((entry) => (
          <div
            key={entry.name}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleFileClick(entry)}
          >
            <p>{entry.name}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          data-testid="modal-backdrop"
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-4 rounded-lg shadow-lg"
          >
            <h3>Metadata</h3>
            <p><strong>Name:</strong> {metadata?.name}</p>
            <p><strong>Type:</strong> {metadata?.type}</p>
            <p><strong>Language:</strong> {metadata?.language}</p>
            <p><strong>Snippet:</strong> {metadata?.textSnippet}</p>
          </div>
        </div>
      )}
    </div>
  );
}
