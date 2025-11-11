// Lightweight duplicate detection utilities
// - FNV-1a 64-bit for a fast deterministic hash
// - SimHash (64-bit) for near-duplicate detection on text

// FNV-1a 64-bit (returns hex string)
export function fnv1a64FromBuffer(buf) {
  // buf: Uint8Array
  const FNV_PRIME_LO = 0x000001b3; // not full 64-bit prime; we'll operate on BigInt
  let hash = 1469598103934665603n; // FNV offset basis
  for (let i = 0; i < buf.length; i++) {
    hash ^= BigInt(buf[i]);
    hash *= 1099511628211n;
    hash &= (BigInt("0xffffffffffffffff"));
  }
  return hash.toString(16).padStart(16, "0");
}

export function fnv1a64FromString(str) {
  const encoder = new TextEncoder();
  return fnv1a64FromBuffer(encoder.encode(str));
}

// Simple tokenization for SimHash
function tokenize(text) {
  if (!text) return [];
  // lowercase and split on non-word characters, keep tokens of length >= 2
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

// Hash a token to 64-bit BigInt using fnv-like
function hashToken64(token) {
  const encoder = new TextEncoder();
  const buf = encoder.encode(token);
  let h = 1469598103934665603n;
  for (let i = 0; i < buf.length; i++) {
    h ^= BigInt(buf[i]);
    h *= 1099511628211n;
    h &= (BigInt("0xffffffffffffffff"));
  }
  return h;
}

// Compute 64-bit SimHash as hex string
export function simhash64(text) {
  const tokens = tokenize(text);
  if (tokens.length === 0) return "0".repeat(16);
  const bits = 64;
  const v = new Array(bits).fill(0);

  for (const t of tokens) {
    const h = hashToken64(t);
    for (let i = 0; i < bits; i++) {
      const bit = (h >> BigInt(i)) & 1n;
      v[i] += bit === 1n ? 1 : -1;
    }
  }

  // build final hash
  let fingerprint = 0n;
  for (let i = 0; i < bits; i++) {
    if (v[i] > 0) {
      fingerprint |= (1n << BigInt(i));
    }
  }

  return fingerprint.toString(16).padStart(16, "0");
}

// Hamming distance between two hex-encoded 64-bit strings
export function hammingDistanceHex(aHex, bHex) {
  try {
    const a = BigInt('0x' + aHex);
    const b = BigInt('0x' + bHex);
    let x = a ^ b;
    let dist = 0;
    while (x) {
      dist += Number(x & 1n);
      x >>= 1n;
    }
    return dist;
  } catch (e) {
    return Infinity;
  }
}

// Convenience: detect near-duplicate based on simhash threshold (default <= 3 bits)
export function isNearDuplicate(simAHex, simBHex, threshold = 3) {
  const d = hammingDistanceHex(simAHex, simBHex);
  return d <= threshold;
}

// Given an array of existing docs [{id, fingerprint:{hash, simhash}}], find duplicates
export function findDuplicates(existing, fingerprint, options = { simThreshold: 3 }) {
  const result = { exact: [], near: [] };
  for (const doc of existing || []) {
    const f = doc.fingerprint || doc;
    if (!f) continue;
    if (f.hash && fingerprint.hash && f.hash === fingerprint.hash) {
      result.exact.push(doc);
      continue;
    }
    if (f.simhash && fingerprint.simhash) {
      if (isNearDuplicate(f.simhash, fingerprint.simhash, options.simThreshold)) {
        result.near.push(doc);
      }
    }
  }
  return result;
}
