import "@/lib/sockjs-shim";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL, getAccessToken } from "@/lib/firebase";

let stompClient = null;
const subscriptions = new Map(); // destination → STOMP subscription object
let _onConnectedCallback = null; // the latest onConnected handler

/**
 * Connect to the STOMP/SockJS WebSocket endpoint.
 *
 * Calling this while already connected (or connecting) is safe — the existing
 * client is reused. The onConnected callback is always updated so that on the
 * next STOMP (re)connect it runs fresh subscriptions.
 *
 * @param {object} handlers
 * @param {(frame: object) => void} [handlers.onConnected]
 * @param {(error: object) => void} [handlers.onError]
 */
export function connectSocket({ onConnected, onError } = {}) {
  // Always update the callback so reconnects pick up the latest version.
  _onConnectedCallback = onConnected ?? null;

  // If a client already exists (connecting OR connected) reuse it.
  // Never create a second Client — that causes orphaned connections that
  // fire onConnect callbacks unpredictably, producing duplicate subscriptions.
  if (stompClient !== null) return;

  const token = getAccessToken();

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),

    connectHeaders: {
      // JWT sent as STOMP passcode — intercepted by WebSocketAuthInterceptor
      passcode: token || "",
      login: "guest",
    },

    reconnectDelay: 2000,

    onConnect: (frame) => {
      // Re-run subscriptions on every (re)connect so they survive auto-reconnect.
      // The subscribe() helper deduplicates at the broker level.
      _onConnectedCallback?.(frame);
    },

    onStompError: (frame) => {
      onError?.(frame);
    },

    onDisconnect: () => {
      // intentionally empty — STOMP handles reconnection internally
    },
  });

  stompClient.activate();
}

/** Disconnect and clean up all subscriptions. */
export function disconnectSocket() {
  subscriptions.forEach((sub) => {
    try {
      sub.unsubscribe();
    } catch (_) {}
  });
  subscriptions.clear();
  _onConnectedCallback = null;
  stompClient?.deactivate();
  stompClient = null;
}

/**
 * Subscribe to a STOMP destination.
 *
 * Idempotent: calling subscribe() for a destination that already has an active
 * subscription properly unsubscribes the old one first (both from our Map and
 * from the STOMP broker), then creates a fresh one. This prevents duplicate
 * deliveries after auto-reconnect or effect re-runs.
 *
 * @param {string} destination
 * @param {(msg: object) => void} callback — receives parsed JSON payload
 * @returns {string|null} subscriptionKey for later unsubscription, or null if not connected
 */
export function subscribe(destination, callback) {
  if (!stompClient) return null;

  const key = destination;

  // Remove any existing subscription for this destination before re-subscribing.
  // This handles both explicit re-subscriptions and auto-reconnect re-runs.
  if (subscriptions.has(key)) {
    try {
      subscriptions.get(key).unsubscribe();
    } catch (_) {}
    subscriptions.delete(key);
  }

  const sub = stompClient.subscribe(destination, (message) => {
    try {
      callback(JSON.parse(message.body));
    } catch {
      callback(message.body);
    }
  });

  subscriptions.set(key, sub);
  return key;
}

/** Unsubscribe from a destination. */
export function unsubscribe(key) {
  if (!key || !subscriptions.has(key)) return;
  try {
    subscriptions.get(key).unsubscribe();
  } catch (_) {}
  subscriptions.delete(key);
}

/**
 * Send a message over STOMP.
 * @param {string} destination — e.g. "/app/chat.message"
 * @param {object} body
 */
export function publishMessage(destination, body) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination,
    body: JSON.stringify(body),
  });
}

/** True if the STOMP client is currently connected. */
export function isConnected() {
  return Boolean(stompClient?.connected);
}
