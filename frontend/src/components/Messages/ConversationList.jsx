import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import ConversationCard from "./ConversationCard";

/**
 * @param {object} props
 * @param {object[]} props.conversations
 * @param {object|null} props.selectedConversation
 * @param {Set<string>} props.onlineUsers — set of online userIds
 * @param {(conv: object) => void} props.onSelect
 * @param {(q: string) => void} props.onNewConversationSearch
 * @param {object[]} props.userSearchResults
 * @param {(user: object) => void} props.onStartConversation
 * @param {boolean} props.isSearching
 */
export default function ConversationList({
  conversations,
  selectedConversation,
  onlineUsers,
  onSelect,
  onNewConversationSearch,
  userSearchResults,
  onStartConversation,
  isSearching,
}) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("filter"); // "filter" | "new"

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    if (mode === "new" && val.length >= 2) {
      onNewConversationSearch(val);
    }
  }

  function toggleMode() {
    setSearch("");
    setMode((m) => (m === "filter" ? "new" : "filter"));
  }

  const filteredConversations = useMemo(() => {
    if (mode === "new") return [];
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUserName?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q),
    );
  }, [search, conversations, mode]);

  return (
    <div className="conv-list">
      <div className="conv-list-header">
        <h2 className="conv-list-title">Messages</h2>
        <button
          onClick={toggleMode}
          className={`conv-new-btn ${mode === "new" ? "conv-new-btn-active" : ""}`}
          title={mode === "new" ? "Cancel" : "New conversation"}
        >
          <UserPlus size={18} />
        </button>
      </div>

      <div className="conv-search-wrap">
        <Search size={16} className="conv-search-icon" />
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder={mode === "new" ? "Search campus users…" : "Search conversations…"}
          className="conv-search-input"
        />
      </div>

      <div className="conv-list-body">
        {mode === "new" ? (
          <>
            {isSearching && (
              <p className="conv-loading">Searching…</p>
            )}
            {!isSearching && search.length >= 2 && userSearchResults.length === 0 && (
              <p className="conv-empty">No users found</p>
            )}
            {userSearchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => onStartConversation(user)}
                className="user-search-row"
              >
                <div className="conv-avatar-wrap">
                  <div className="conv-avatar conv-avatar-sm">
                    {(user.name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  {onlineUsers?.has(user.id) && <span className="online-dot" />}
                </div>
                <div className="conv-info">
                  <span className="conv-name">{user.name}</span>
                  <span className="conv-time">{user.email}</span>
                </div>
              </button>
            ))}
            {!isSearching && search.length < 2 && (
              <p className="conv-hint">Type at least 2 characters to search</p>
            )}
          </>
        ) : (
          <>
            {filteredConversations.length === 0 && (
              <p className="conv-empty">
                {search ? "No matches" : "No conversations yet"}
              </p>
            )}
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                selected={selectedConversation?.id === conversation.id}
                isOnline={onlineUsers?.has(conversation.otherUserId)}
                onClick={() => onSelect(conversation)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}