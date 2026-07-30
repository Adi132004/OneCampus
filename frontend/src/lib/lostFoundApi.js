import { API_BASE_URL, getAccessToken } from "@/lib/firebase";

function authHeaders() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || "Lost and found request failed");
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

  const response = await fetch(`${API_BASE_URL}/api/lost-found/upload`, {
    method: "POST",
    headers: {
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
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

export async function deleteLostFoundItem(itemId) {
  const response = await fetch(`${API_BASE_URL}/api/lost-found/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to delete item");
  }
}
