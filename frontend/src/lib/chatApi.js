import { API_BASE_URL, getAccessToken } from "@/lib/firebase";

function authHeaders() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (response.status === 403) throw new Error("FORBIDDEN");
  const text = await response.text();
  if (!response.ok) {
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || text || "Chat request failed");
    } catch {
      throw new Error(text || "Chat request failed");
    }
  }
  return text ? JSON.parse(text) : null;
}

/** Fetch all conversations for the current user. */
export async function fetchConversations() {
  const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await handleResponse(response);
  return data || [];
}

/**
 * Create or retrieve an existing conversation.
 * @param {string} otherUserId
 * @param {string|null} lostReportId — optional, pass null for direct messages
 */
export async function createConversation(otherUserId, lostReportId = null) {
  const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ otherUserId, lostReportId }),
  });
  return handleResponse(response);
}

/**
 * Fetch paginated messages for a conversation.
 * @param {string} conversationId
 * @param {number} page — 0-indexed
 * @param {number} size — messages per page
 */
export async function fetchMessages(conversationId, page = 0, size = 30) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
}

/**
 * Send a message via REST (WebSocket fallback).
 */
export async function sendMessage(conversationId, receiverId, text) {
  const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      conversationId,
      receiverId,
      message: text,
    }),
  });
  return handleResponse(response);
}

/** Mark all messages in a conversation as read. */
export async function markRead(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/read`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
}

/**
 * Search campus users by name.
 * @param {string} q — search query
 */
export async function searchUsers(q) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/users/search?q=${encodeURIComponent(q)}`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
}
