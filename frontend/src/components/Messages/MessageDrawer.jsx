import { useCallback, useEffect, useRef, useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";
import { fetchConversations, createConversation, searchUsers } from "@/lib/chatApi";
import {
  connectSocket,
  disconnectSocket,
  subscribe,
  unsubscribe,
} from "@/lib/chatSocket";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import "./Messages.css";

/**
 * @param {object} props
 * @param {boolean} props.isOpen — controlled by parent (Navbar)
 * @param {(open: boolean) => void} props.onOpenChange
 */
export default function MessageDrawer({ isOpen, onOpenChange }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentAuthUser());
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchTimerRef = useRef(null);

  // Track auth
  useEffect(() => {
    const unsub = subscribeToAuth(setCurrentUser);
    return () => unsub();
  }, []);

  // Load conversations when drawer opens
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    loadConversations();
  }, [isOpen, currentUser]);

  // Manage WebSocket connection
  useEffect(() => {
    if (!currentUser) return;

    if (!isOpen) {
      // When the drawer closes, disconnect to free the socket.
      // ChatWindow unmounts automatically because it's a child of this component.
      disconnectSocket();
      return;
    }

    // Called every time STOMP (re)connects. Registering here guarantees
    // subscriptions survive network drops and auto-reconnects.
    function setupSubscriptions() {
      subscribe(`/user/${currentUser.uid}/queue/conversations`, (msg) => {
        setConversations((prev) => {
          const existing = prev.find((c) => c.id === msg.conversationId);
          if (existing) {
            return prev
              .map((c) =>
                c.id === msg.conversationId
                  ? { ...c, lastMessage: msg.message, lastMessageAt: msg.timestamp }
                  : c,
              )
              .sort(
                (a, b) =>
                  new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0),
              );
          }
          // New conversation — reload list
          loadConversations();
          return prev;
        });
      });

      subscribe("/topic/presence", ({ userId, online }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (online) next.add(userId);
          else next.delete(userId);
          return next;
        });
      });
    }

    connectSocket({
      // Fires on every (re)connect — fresh subscriptions each time.
      onConnected: setupSubscriptions,
    });

    // If the socket was already connected before this effect ran (e.g. drawer
    // reopened without a disconnect), set up subscriptions immediately rather
    // than waiting for the next onConnect event which may never come.
    if (isConnected()) {
      setupSubscriptions();
    }

    return () => {
      // The subscribe() helper is idempotent — unsubscribing here is safe and
      // prevents stale callbacks from accumulating across effect re-runs.
      unsubscribe(`/user/${currentUser?.uid}/queue/conversations`);
      unsubscribe("/topic/presence");
    };
  }, [isOpen, currentUser?.uid]);


  async function loadConversations() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleNewConversationSearch = useCallback(
    (q) => {
      clearTimeout(searchTimerRef.current);
      if (q.length < 2) {
        setUserSearchResults([]);
        return;
      }
      setIsSearching(true);
      searchTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchUsers(q);
          setUserSearchResults(results);
        } catch {
          setUserSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [],
  );

  async function handleStartConversation(user) {
    try {
      const conv = await createConversation(user.id);
      // Add to list if not already present
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      setSelectedConversation(conv);
      setUserSearchResults([]);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  }

  function handleMessageSent() {
    // Reload conversation list to update last message + timestamp
    loadConversations();
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  if (!currentUser) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => onOpenChange(false)}
          className="drawer-overlay"
        />
      )}

      {/* Drawer */}
      <div className={`msg-drawer ${isOpen ? "msg-drawer-open" : ""}`}>
        {/* Drawer header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <MessageSquare size={22} className="drawer-header-icon" />
            <h1 className="drawer-title">Inbox</h1>
            {totalUnread > 0 && (
              <span className="drawer-unread-total">{totalUnread}</span>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="drawer-close-btn"
            aria-label="Close inbox"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="drawer-body">
          {loading && conversations.length === 0 ? (
            <div className="drawer-loading">
              <div className="drawer-spinner" />
              <p>Loading conversations…</p>
            </div>
          ) : (
            <>
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onlineUsers={onlineUsers}
                onSelect={setSelectedConversation}
                onNewConversationSearch={handleNewConversationSearch}
                userSearchResults={userSearchResults}
                onStartConversation={handleStartConversation}
                isSearching={isSearching}
              />

              <ChatWindow
                conversation={selectedConversation}
                currentUserId={currentUser.uid}
                onlineUsers={onlineUsers}
                onMessageSent={handleMessageSent}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}