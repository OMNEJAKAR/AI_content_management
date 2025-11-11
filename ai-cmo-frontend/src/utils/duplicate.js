// Lightweight duplicate detection utilities
// - FNV-1a 64-bit for a fast deterministic hash
// - SimHash (64-bit) for near-duplicate detection on text

// FNV-1a 64-bit hash for exact matching
export function calculateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  let hash = 14695981039346656037n; // FNV offset basis
  const prime = 1099511628211n;
  
  for (const byte of data) {
    hash ^= BigInt(byte);
    hash *= prime;
  }
  
  return hash.toString(16);
}

// Simple tokenization for SimHash
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

// Hash function for tokens
function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  let h = 0xdeadbeefn;
  
  for (const byte of data) {
    h = ((h ^ BigInt(byte)) * 2654435761n) % 2n**64n;
  }
  
  return h;
}

// Calculate SimHash for near-duplicate detection
export function calculateSimHash(text) {
  const v = new Array(64).fill(0);
  const words = tokenize(text);
  
  for (const word of words) {
    const hash = hashToken(word);
    for (let i = 0; i < 64; i++) {
      v[i] += ((hash & (1n << BigInt(i))) !== 0n) ? 1 : -1;
    }
  }
  
  let simhash = 0n;
  for (let i = 0; i < 64; i++) {
    if (v[i] > 0) simhash |= (1n << BigInt(i));
  }
  
  return simhash.toString(16);
}

// Calculate Hamming distance between two hex strings
export function hammingDistance(str1, str2) {
  const n1 = BigInt(`0x${str1}`);
  const n2 = BigInt(`0x${str2}`);
  let xor = n1 ^ n2;
  let distance = 0;
  
  while (xor > 0n) {
    if (xor & 1n) distance++;
    xor >>= 1n;
  }
  
  return distance;
}

/**
 * Find exact and near-duplicate matches for a document
 * @param {Array} docs - Array of documents to check against
 * @param {Object} fingerprint - Fingerprint object with hash and simhash
 * @param {number} threshold - Hamming distance threshold (default: 3)
 * @returns {Object} Results containing exact and near matches
 */
export function findDuplicates(docs, fingerprint, threshold = 3) {
  const results = {
    exact: [],  // Exact hash matches
    near: []    // Similar content based on simhash
  };
  
  for (const doc of docs) {
    // Check for exact duplicates using hash
    if (doc.fingerprint.hash === fingerprint.hash) {
      results.exact.push(doc);
      continue;
    }
    
    // Check for near-duplicates using simhash
    const distance = hammingDistance(
      doc.fingerprint.simhash,
      fingerprint.simhash
    );
    
    if (distance <= threshold) {
      results.near.push(doc);
    }
  }
  
  return results;
}