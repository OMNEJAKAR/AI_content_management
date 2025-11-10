const AUDIT_KEY = "auditLog";

function getCurrentUsername() {
  try {
    const name = localStorage.getItem("authUser");
    return name || "guest";
  } catch {
    return "guest";
  }
}

export function getAudit() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list;
  } catch {
    return [];
  }
}

export function logAudit(eventType, data = {}) {
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: eventType,
    user: getCurrentUsername(),
    at: new Date().toISOString(),
    data,
  };

  const list = getAudit();
  list.push(entry);
  // Optional: cap to last 500 entries
  const trimmed = list.slice(-500);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event("auditLogChanged"));
  return entry;
}
