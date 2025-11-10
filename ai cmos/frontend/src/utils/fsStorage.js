import { openDB } from "idb";

const DB_NAME = "ai-cmo-fs";
const STORE = "folders";

// ✅ Helper: safely get current logged-in username
function getUserKeyPrefix() {
  try {
    const authUser = localStorage.getItem("authUser");
    if (authUser) return `${authUser}_`;

    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username;
    if (username) return `${username}_`;

    return "guest_";
  } catch {
    return "guest_";
  }
}

// Verify folder handle is still valid
export async function verifyFolderAccess(handle) {
  try {
    const options = { mode: 'read' };
    const permission = await handle.queryPermission(options);
    
    if (permission === 'granted') {
      return true;
    }
    
    // If not already granted, request permission
    return await handle.requestPermission(options) === 'granted';
  } catch (e) {
    console.error('Folder access verification failed:', e);
    return false;
  }
}

// ✅ Save a folder handle for the current user
export async function saveFolderHandle(id, handle) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });

  const userKey = getUserKeyPrefix() + id;
  await db.put(STORE, handle, userKey);
}

// ✅ Get all folder handles for the current user
export async function getAllFolderHandles() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });

  const prefix = getUserKeyPrefix();
  const all = [];

  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  let cursor = await store.openCursor();

  while (cursor) {
    if (cursor.key.startsWith(prefix)) {
      try {
        const handle = cursor.value;
        // Check if handle is still valid
        if (handle && typeof handle.kind === 'string') {
          const permission = await handle.queryPermission({ mode: 'read' });
          if (permission === 'granted') {
            all.push({
              id: cursor.key.replace(prefix, ""),
              handle: handle,
            });
          }
        }
      } catch (e) {
        console.warn('Invalid handle found, skipping:', e);
      }
    }
    cursor = await cursor.continue();
  }

  await tx.done;
  return all;
}

// ✅ Delete a folder handle (user-specific)
export async function deleteFolderHandle(id) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });

  const userKey = getUserKeyPrefix() + id;
  await db.delete(STORE, userKey);
}
