import { API_BASE_URL, getAccessToken, logoutUser } from "@/lib/firebase";

function authHeaders() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  if (response.status === 401) {
    // Clear any stale auth state so UI doesn't treat a cached profile
    // as an active session. This prevents redirect loops where a
    // protected page redirects to login and the login page immediately
    // redirects back because a stale profile remained in storage.
    try {
      logoutUser();
    } catch {
      // ignore
    }
    throw new Error("UNAUTHORIZED");
  }
  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }
  const text = await response.text();
  if (!response.ok) {
    // Try to extract a meaningful message from the JSON error body
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || text || "Lost and found request failed");
    } catch {
      throw new Error(text || "Lost and found request failed");
    }
  }
  return text ? JSON.parse(text) : null;
}

export async function fetchLostFoundItems() {
  const response = await fetch(`${API_BASE_URL}/api/lost-found`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

/**
 * Fetches a single lost-found item by ID.
 * The backend enforces campus isolation — it returns 403 if the item
 * belongs to a different institute, and 404 if the item does not exist.
 */
export async function fetchLostFoundItemById(itemId) {
  const response = await fetch(`${API_BASE_URL}/api/lost-found/${itemId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function createLostFoundItem(payload) {
  const response = await fetch(`${API_BASE_URL}/api/lost-found`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function createLostFoundItemWithFile(payload, file) {
  const fd = new FormData();
  // attach JSON payload as a part named 'data'
  fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (file) fd.append("file", file, file.name);

  // Snapshot the token once so both the header value and the conditional check
  // are consistent even if the token storage is updated between calls.
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/lost-found/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // DO NOT set Content-Type; browser will set the multipart boundary
    },
    body: fd,
  });
  return handleResponse(response);
}

export async function updateLostFoundItem(itemId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/lost-found/${itemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateLostFoundItemWithFile(itemId, payload, file) {
  const fd = new FormData();
  fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (file) fd.append("file", file, file.name);

  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/lost-found/${itemId}/upload`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: fd,
  });
  return handleResponse(response);
}

export async function deleteLostFoundItem(itemId) {
  const response = await fetch(`${API_BASE_URL}/api/lost-found/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    try {
      logoutUser();
    } catch {}
    throw new Error("UNAUTHORIZED");
  }
  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }
  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || text || "Unable to delete item");
    } catch {
      throw new Error(text || "Unable to delete item");
    }
  }
}

export async function repostLostFoundItem(itemId, targetStatus) {
  const query = targetStatus ? `?status=${encodeURIComponent(targetStatus)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/lost-found/${itemId}/repost${query}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(response);
}
