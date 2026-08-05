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
    try {
      logoutUser();
    } catch {}
    throw new Error("UNAUTHORIZED");
  }
  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }
  const text = await response.text();
  if (!response.ok) {
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || text || "Event request failed");
    } catch {
      throw new Error(text || "Event request failed");
    }
  }
  return text ? JSON.parse(text) : null;
}

export async function fetchEvents() {
  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function createEvent(payload) {
  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
