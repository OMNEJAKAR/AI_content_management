import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateHash, calculateSimHash, findDuplicates } from '../utils/duplicate';

export default function DuplicateTest() {
  const [files, setFiles] = useState([]);
  const [duplicateResults, setDuplicateResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [threshold, setThreshold] = useState(3);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Read file content
      const text = await file.text();
      
      // Create document with fingerprints
      const doc = {
        id: Date.now().toString(),
        name: file.name,
        text,
        fingerprint: {
          hash: await calculateHash(text),
          simhash: calculateSimHash(text)
        }
      };

      // Check for duplicates against existing files
      if (files.length > 0) {
        const dupes = findDuplicates(files, doc.fingerprint, threshold);
        setDuplicateResults(dupes);
      }

      setFiles(prev => [...prev, doc]);
      setSelectedFile(doc);
    } catch (err) {
      console.error("Error processing file:", err);
      alert("Error processing file. See console for details.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Duplicate Detection Test</h1>
      <p className="mb-4">Upload text files to test duplicate & near-duplicate detection.</p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Similarity Threshold (Hamming distance)
          <input
            type="range"
            min="1"
            max="10"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-500">Current: {threshold} bits</span>
        </label>
      </div>

      <div className="mb-4">
        <input 
          type="file" 
          accept=".txt,.md,.csv,.json"
          onChange={handleFileSelect}
          className="mb-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File List */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Added Files</h3>
          <ul className="space-y-2">
            {files.map(file => (
              <li 
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`p-2 rounded cursor-pointer ${
                  selectedFile?.id === file.id 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {file.name}
              </li>
            ))}
          </ul>
        </div>

        {/* File Details & Duplicates */}
        <div className="col-span-2 border rounded p-4">
          {selectedFile && (
            <div>
              <h3 className="font-semibold mb-2">Selected File Details</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto mb-4 text-sm">
{`Name: ${selectedFile.name}
Content Preview: ${selectedFile.text.slice(0, 100)}...
Hash: ${selectedFile.fingerprint.hash}
SimHash: ${selectedFile.fingerprint.simhash}`}
              </pre>
            </div>
          )}

          {duplicateResults && (
            <div>
              <h3 className="font-semibold mb-2">Duplicate Check Results</h3>
              
              {duplicateResults.exact.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-red-600 font-medium">Exact Duplicates:</h4>
                  <ul className="list-disc pl-5">
                    {duplicateResults.exact.map(f => (
                      <li key={f.id}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {duplicateResults.near.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-yellow-600 font-medium">Near Duplicates (Similar Content):</h4>
                  <ul className="list-disc pl-5">
                    {duplicateResults.near.map(f => (
                      <li key={f.id}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {duplicateResults.exact.length === 0 && duplicateResults.near.length === 0 && (
                <p className="text-green-600">No duplicates found!</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link to="/sources" className="text-blue-600 hover:underline">
          ← Back to Sources
        </Link>
      </div>
    </div>
  );
}