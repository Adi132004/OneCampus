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
