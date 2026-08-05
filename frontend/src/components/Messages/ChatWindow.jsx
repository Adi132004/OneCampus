import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMessages, markRead, sendMessage } from "@/lib/chatApi";
import { subscribe, unsubscribe, publishMessage, isConnected } from "@/lib/chatSocket";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const PAGE_SIZE = 30;

/**
 * @param {object} props
 * @param {object|null} props.conversation — ConversationDto
 * @param {string} props.currentUserId
 * @param {Set<string>} props.onlineUsers
 * @param {(msg: object) => void} props.onMessageSent — update parent conversation list
 */
export default function ChatWindow({
  conversation,
  currentUserId,
  onlineUsers,
  onMessageSent,
}) {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  /**
   * Maps  optimisticId → { conversationId, message (text) }
   * Populated synchronously in handleSend before publishMessage().
   * Consumed (and deleted) inside the WS subscription callback.
   *
   * Using a ref keeps it stable across renders without triggering re-renders.
   */
  const pendingOptimisticRef = useRef({});

  // ── Load initial messages whenever conversation changes ───────────────────
  useEffect(() => {
    if (!conversation) return;
    setMessages([]);
    setPage(0);
    setHasMore(true);
    loadMessages(conversation.id, 0, true);
    // Mark as read on open
    markRead(conversation.id).catch(() => {});
  }, [conversation?.id]);

  // ── Subscribe to real-time messages for this conversation ─────────────────
  useEffect(() => {
    if (!conversation) return;
    const destMessages = `/topic/conversation.${conversation.id}`;
    const destRead = `/topic/conversation.${conversation.id}.read`;

    const subKey = subscribe(destMessages, (msg) => {
      setMessages((prev) => {
        // Guard 1: strict dedup by server ID
        if (prev.some((m) => !m._optimistic && m.id === msg.id)) return prev;

        // Check if this message is from us.
        // We use conversation.otherUserId to safely identify our own messages,
        // avoiding potential type/format mismatches with currentUserId.
        const isMine = msg.senderId === currentUserId || msg.senderId !== conversation.otherUserId;

        if (isMine) {
          // Find the best optimistic message match
          let matchId = null;
          const pendingEntries = Object.entries(pendingOptimisticRef.current);
          
          if (pendingEntries.length > 0) {
            const matchEntry = pendingEntries.find(
              ([, meta]) => meta.conversationId === msg.conversationId && meta.message === msg.message
            ) ?? pendingEntries[0];
            matchId = matchEntry[0];
            delete pendingOptimisticRef.current[matchId];
          }

          // Scan prev to replace the optimistic message
          const orphanIdx = prev.findIndex(
            (m) =>
              m._optimistic &&
              ((matchId && m.id === matchId) ||
               (m.conversationId === msg.conversationId && m.message === msg.message))
          );

          if (orphanIdx !== -1) {
            const next = [...prev];
            next[orphanIdx] = msg; // Replace optimistic with confirmed
            return next;
          }
        }

        // Fallthrough: new message, just append
        return [...prev, msg];
      });

      // Auto-mark as read if the receiver is current user
      if (msg.receiverId === currentUserId) {
        markRead(conversation.id).catch(() => {});
      }
    });

    const subReadKey = subscribe(destRead, (event) => {
      if (event.readBy !== currentUserId) {
        // Our sent messages have been read — update their read status
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUserId ? { ...m, read: true } : m,
          ),
        );
      }
    });

    return () => {
      unsubscribe(subKey);
      unsubscribe(subReadKey);
    };
  }, [conversation?.id, currentUserId]);

  // ── Auto-scroll to bottom when messages change ────────────────────────────
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  async function loadMessages(conversationId, pageNum, reset = false) {
    setLoading(true);
    try {
      const data = await fetchMessages(conversationId, pageNum, PAGE_SIZE);
      if (reset) {
        setMessages(data);
      } else {
        setMessages((prev) => [...data, ...prev]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadOlder() {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadMessages(conversation.id, nextPage, false);
  }

  const handleSend = useCallback(
    async (text) => {
      if (!conversation || sending) return;
      setSending(true);

      const optimisticId = `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic = {
        id: optimisticId,
        conversationId: conversation.id,
        senderId: currentUserId,
        receiverId: conversation.otherUserId,
        message: text,
        timestamp: new Date().toISOString(),
        read: false,
        delivered: false,
        _optimistic: true,
      };

      // Show the message immediately (optimistic UI)
      setMessages((prev) => [...prev, optimistic]);

      try {
        if (isConnected()) {
          // ── WebSocket path ────────────────────────────────────────────────
          // Track this optimistic entry BEFORE publishing so the subscription
          // handler can reliably match it when the echo arrives.
          pendingOptimisticRef.current[optimisticId] = {
            conversationId: conversation.id,
            message: text,
          };

          publishMessage("/app/chat.message", {
            conversationId: conversation.id,
            receiverId: conversation.otherUserId,
            message: text,
          });

          // The WS subscription handler will replace the optimistic bubble
          // with the confirmed server message when the echo arrives.
          // We call onMessageSent here (not in the callback) to avoid an
          // extra async step in the happy path.
          onMessageSent?.({ conversationId: conversation.id, message: text });
        } else {
          // ── REST fallback (WebSocket unavailable) ─────────────────────────
          const sent = await sendMessage(
            conversation.id,
            conversation.otherUserId,
            text,
          );
          // Replace the optimistic bubble with the confirmed REST response.
          setMessages((prev) =>
            prev.map((m) =>
              m._optimistic && m.id === optimisticId ? sent : m,
            ),
          );
          onMessageSent?.(sent);
        }
      } catch (err) {
        // Remove the optimistic bubble and clean up the ref on failure.
        delete pendingOptimisticRef.current[optimisticId];
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        console.error("Failed to send message:", err);
      } finally {
        setSending(false);
      }
    },
    [conversation, currentUserId, sending, onMessageSent],
  );

  if (!conversation) {
    return (
      <div className="chat-empty-state">
        <div className="chat-empty-icon">💬</div>
        <p className="chat-empty-text">Select a conversation to start chatting</p>
      </div>
    );
  }

  const isOnline = onlineUsers?.has(conversation.otherUserId);

  return (
    <div className="chat-window">
      <ChatHeader conversation={conversation} isOnline={isOnline} />

      <div className="chat-messages" ref={containerRef}>
        {hasMore && (
          <button
            onClick={loadOlder}
            disabled={loading}
            className="load-older-btn"
          >
            {loading ? "Loading…" : "Load older messages"}
          </button>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  );
}