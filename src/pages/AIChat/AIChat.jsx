import { useEffect, useRef, useState } from "react";
import { ImagePlus, MessageSquarePlus, Search, Send } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CONVERSATIONS, MESSAGES } from "@/lib/mock-data";

export function AIChatPage() {
  const [active, setActive] = useState(CONVERSATIONS[0]?.id ?? null);
  const [messagesByConv, setMessagesByConv] = useState(() => {
    const map = {};
    for (const c of CONVERSATIONS) map[c.id] = [];
    if (CONVERSATIONS[0]) map[CONVERSATIONS[0].id] = [...MESSAGES];
    return map;
  });
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const activeConv = CONVERSATIONS.find((c) => c.id === active) ?? null;
  const activeMessages = active ? messagesByConv[active] ?? [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages.length, active]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg = { id: `${Date.now()}`, text, mine: true, time };
    setMessagesByConv((prev) => ({
      ...prev,
      [active]: [...(prev[active] ?? []), newMsg],
    }));
    setDraft("");
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
                <input
                  placeholder="Search..."
                  className="w-full rounded-full border border-white/70 bg-white/58 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto px-2 pb-3">
              {CONVERSATIONS.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActive(c.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${active === c.id ? "bg-white/70" : "hover:bg-white/48"}`}
                  >
                    <div className="relative">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                        {c.initials}
                      </div>
                      {c.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[oklch(0.7_0.18_150)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {c.name}
                        </span>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">
                          {c.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">{c.last}</span>
                        {c.unread && (
                          <span className="rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {activeConv ? (
            <section className="flex min-h-0 flex-col">
              <header className="flex items-center gap-3 border-b border-white/60 px-5 py-3.5">
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                    {activeConv.initials}
                  </div>
                  {activeConv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[oklch(0.7_0.18_150)]" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{activeConv.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {activeConv.online ? "Online" : "Offline"}
                  </div>
                </div>
              </header>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
                {activeMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${m.mine ? "bg-primary text-primary-foreground" : "bg-white/58 text-foreground"}`}
                    >
                      <div>{m.text}</div>
                      <div
                        className={`mt-1 font-mono text-[10px] uppercase ${m.mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form
                className="flex items-center gap-2 border-t border-white/60 p-3"
                onSubmit={handleSend}
              >
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/58 text-foreground/70 hover:text-foreground"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-white/70 bg-white/58 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  className="orange-button grid h-10 w-10 place-items-center rounded-full text-white"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

            </section>
          ) : (
            <section className="grid place-items-center p-10 text-center">
              <div>
                <div className="font-display text-5xl">...</div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  Pick a conversation
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose someone from the list to start chatting.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
