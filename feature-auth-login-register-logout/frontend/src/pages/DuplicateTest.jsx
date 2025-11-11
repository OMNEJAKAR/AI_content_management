import React, { useState } from 'react';
import { extractFileData } from '../utils/fileProcessor';
import { findDuplicates } from '../utils/duplicate';

export default function DuplicateTest() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [duplicates, setDuplicates] = useState(null);

  const handleFiles = async (e) => {
    setProcessing(true);
    try {
      const newFiles = [];
      
      for (const file of e.target.files) {
        // Wrap File in a FileSystemFileHandle-like interface
        const entry = {
          kind: 'file',
          name: file.name,
          getFile: async () => file
        };
        
        const data = await extractFileData(entry);
        if (data) {
          newFiles.push({
            id: Date.now() + '_' + file.name,
            ...data
          });
        }
      }

      // Find duplicates among new + existing files
      const allFiles = [...files, ...newFiles];
      const dupResults = {};

      for (const file of newFiles) {
        const existing = files.map(f => ({ 
          id: f.id, 
          name: f.name,
          fingerprint: f.fingerprint 
        }));
        
        const dups = findDuplicates(existing, file.fingerprint);
        if (dups.exact.length > 0 || dups.near.length > 0) {
          dupResults[file.id] = dups;
        }
      }

      setFiles(allFiles);
      setDuplicates(dupResults);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Duplicate Detection Test</h2>
      <p>Add some files to test duplicate/near-duplicate detection:</p>
      
      <input 
        type="file" 
        multiple 
        onChange={handleFiles}
        disabled={processing}
        accept=".txt,.pdf,.md,.csv,text/*"
      />
      
      {processing && <p>Processing files...</p>}

      <div style={{ marginTop: 20 }}>
        <h3>Processed Files ({files.length})</h3>
        {files.map(file => (
          <div 
            key={file.id}
            style={{
              padding: 10,
              margin: '10px 0',
              border: '1px solid #ddd',
              borderRadius: 4,
              background: duplicates?.[file.id] ? '#fff3cd' : '#fff'
            }}
          >
            <div><b>{file.name}</b> ({file.sizeKB} KB)</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              Hash: {file.fingerprint?.hash || 'none'}<br/>
              SimHash: {file.fingerprint?.simhash || 'none'}
            </div>
            {duplicates?.[file.id] && (
              <div style={{ marginTop: 8, fontSize: '0.9em', color: '#664d03', background: '#fff3cd', padding: 8, borderRadius: 4 }}>
                {duplicates[file.id].exact.length > 0 && (
                  <div>
                    Exact duplicates: {duplicates[file.id].exact.map(d => d.name).join(', ')}
                  </div>
                )}
                {duplicates[file.id].near.length > 0 && (
                  <div>
                    Near duplicates: {duplicates[file.id].near.map(d => d.name).join(', ')}
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: '0.85em', color: '#666' }}>
              <b>Text snippet:</b><br/>
              <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>
                {file.textSnippet || '(no text extracted)'}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}