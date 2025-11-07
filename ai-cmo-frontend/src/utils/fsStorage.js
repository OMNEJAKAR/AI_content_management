import { openDB } from "idb";

const DB_NAME = "ai-cmo-fs";
const STORE = "folders";

// ✅ Helper: safely get current logged-in username
function getUserKeyPrefix() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "guest";
    return `${username}_`;
  } catch {
    return "guest_";
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
      all.push({
        id: cursor.key.replace(prefix, ""),
        handle: cursor.value,
      });
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
