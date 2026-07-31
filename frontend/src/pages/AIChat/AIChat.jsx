import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquarePlus, Search, Send } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { API_BASE_URL, getAccessToken, getCurrentAuthUser } from "@/lib/firebase";

export function AIChatPage() {
  const [conversations, setConversations] = useState([]);
  const [messagesByConv, setMessagesByConv] = useState({});
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const activeConv = useMemo(() => conversations.find((c) => c.id === active) ?? null, [active, conversations]);
  const activeMessages = active ? messagesByConv[active] ?? [] : [];

  useEffect(() => {
    const loadConversations = async () => {
      const token = getAccessToken();
      if (!token) {
        setError("Please sign in to view messages.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unable to load conversations.");
        const data = await response.json();
        setConversations(data);
        if (data.length && !active) {
          const selected = data[0];
          setActive(selected.id);
          await loadMessagesForConversation(selected.id, token);
        }
      } catch (err) {
        setError(err.message || "Unable to load conversations.");
      } finally {
        setLoading(false);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get("conversation");
    if (conversationId) {
      setActive(conversationId);
    }

    loadConversations();
    const interval = window.setInterval(() => {
      if (getAccessToken()) {
        loadConversations();
        if (active) {
          loadMessagesForConversation(active, getAccessToken());
        }
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages.length, active]);

  async function loadMessagesForConversation(conversationId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to load messages.");
      const data = await response.json();
      const currentUserId = getCurrentAuthUser()?.uid || null;
      const normalized = data.map((msg) => ({
        id: msg.id,
        text: msg.message,
        mine: msg.senderId === currentUserId,
        time: formatTimestamp(msg.timestamp),
      }));
      setMessagesByConv((prev) => ({ ...prev, [conversationId]: normalized }));
    } catch (err) {
      setError(err.message || "Unable to load messages.");
    }
  }

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;

    const token = getAccessToken();
    const currentConversation = conversations.find((conversation) => conversation.id === active);
    const receiverId = currentConversation?.user1Id === getCurrentAuthUser()?.uid ? currentConversation?.user2Id : currentConversation?.user1Id;

    if (!token || !receiverId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId: active, receiverId, message: text }),
      });
      if (!response.ok) throw new Error("Unable to send message.");
      const message = await response.json();
      setMessagesByConv((prev) => ({
        ...prev,
        [active]: [
          ...(prev[active] ?? []),
          {
            id: message.id,
            text: message.message,
            mine: true,
            time: formatTimestamp(message.timestamp),
          },
        ],
      }));
      setDraft("");
      setError("");
    } catch (err) {
      setError(err.message || "Unable to send message.");
    }
  };

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="glass-card-strong grid h-[calc(100vh-180px)] min-h-[560px] grid-cols-1 overflow-hidden rounded-[2rem] md:grid-cols-[320px_1fr]">
          <aside className="flex flex-col border-r border-white/60 bg-white/28">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">Messages</h2>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                  <MessageSquarePlus className="h-4 w-4" />
                </button>
              </div>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Search..." className="w-full rounded-full border border-white/70 bg-white/58 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto px-2 pb-3">
              {loading ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">Loading conversations…</li>
              ) : conversations.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">No conversations yet.</li>
              ) : (
                conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button onClick={() => setActive(conversation.id)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${active === conversation.id ? "bg-white/70" : "hover:bg-white/48"}`}>
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                        {conversation.otherUserName?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">{conversation.otherUserName || "Conversation"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-muted-foreground">{conversation.lastMessage || "Start the conversation"}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </aside>

          {activeConv ? (
            <section className="flex min-h-0 flex-col">
              <header className="flex items-center gap-3 border-b border-white/60 px-5 py-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                  {activeConv.otherUserName?.slice(0, 2).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{activeConv.otherUserName || "Conversation"}</div>
                  <div className="text-xs text-muted-foreground">Connected through lost report</div>
                </div>
              </header>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
                {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
                {activeMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${message.mine ? "bg-primary text-primary-foreground" : "bg-white/58 text-foreground"}`}>
                      <div>{message.text}</div>
                      <div className={`mt-1 font-mono text-[10px] uppercase ${message.mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{message.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <form className="flex items-center gap-2 border-t border-white/60 p-3" onSubmit={handleSend}>
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." className="flex-1 rounded-full border border-white/70 bg-white/58 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="submit" className="orange-button grid h-10 w-10 place-items-center rounded-full text-white">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </section>
          ) : (
            <section className="grid place-items-center p-10 text-center">
              <div>
                <div className="font-display text-5xl">💬</div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Pick a conversation</h3>
                <p className="mt-1 text-sm text-muted-foreground">Choose a recent lost-and-found match to continue the chat.</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
