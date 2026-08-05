import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";
import { fetchConversations, createConversation, searchUsers } from "@/lib/chatApi";
import {
  connectSocket,
  disconnectSocket,
  subscribe,
  unsubscribe,
  isConnected,
} from "@/lib/chatSocket";
import ConversationList from "@/components/Messages/ConversationList";
import ChatWindow from "@/components/Messages/ChatWindow";
import "@/components/Messages/Messages.css";

export function AIChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchTimerRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Track auth
  useEffect(() => {
    const unsub = subscribeToAuth(setCurrentUser);
    return () => unsub();
  }, []);

  // Manage WebSocket connection & load initial data
  useEffect(() => {
    if (!currentUser) return;

    // Load initial conversations
    async function init() {
      setLoading(true);
      try {
        const data = await fetchConversations();
        setConversations(data || []);
        
        // Auto-select conversation based on URL or defaults to the first one
        const params = new URLSearchParams(window.location.search);
        const conversationId = params.get("conversation");
        
        if (data && data.length > 0 && isInitialLoad.current) {
          isInitialLoad.current = false;
          if (conversationId) {
            const target = data.find(c => c.id === conversationId);
            if (target) setSelectedConversation(target);
            else setSelectedConversation(data[0]);
          } else {
            setSelectedConversation(data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    }
    
    init();

    // Setup STOMP subscriptions
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
          init();
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
      onConnected: setupSubscriptions,
    });

    if (isConnected()) {
      setupSubscriptions();
    }

    return () => {
      unsubscribe(`/user/${currentUser?.uid}/queue/conversations`);
      unsubscribe("/topic/presence");
      disconnectSocket();
    };
  }, [currentUser?.uid]);

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
    // Rely on STOMP queue for updates, but can optionally refresh here
  }

  const totalUnread = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) || 0;

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="glass-card-strong flex h-[calc(100vh-180px)] min-h-[560px] flex-col overflow-hidden rounded-[2rem] md:flex-row">
          
          <aside className="flex w-full flex-col border-r border-white/60 bg-white/28 md:w-[320px]">
            {!currentUser ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Please sign in to view messages.
              </div>
            ) : loading && conversations.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="flex h-full flex-col [&_.conv-list]:h-full [&_.conv-list]:flex-1 [&_.conv-list-body]:flex-1">
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
              </div>
            )}
          </aside>

          <section className="flex flex-1 flex-col bg-white/10">
            {currentUser && selectedConversation ? (
              <div className="flex h-full flex-col [&_.chat-window]:h-full [&_.chat-window]:flex-1">
                <ChatWindow
                  conversation={selectedConversation}
                  currentUserId={currentUser.uid}
                  onlineUsers={onlineUsers}
                  onMessageSent={handleMessageSent}
                />
              </div>
            ) : (
              <div className="grid flex-1 place-items-center p-10 text-center">
                <div>
                  <div className="font-display text-5xl">💬</div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Select a conversation</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Pick a match or search for a user to start chatting.</p>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
