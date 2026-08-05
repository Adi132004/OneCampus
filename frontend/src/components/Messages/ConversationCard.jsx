import { formatDistanceToNow } from "date-fns";

/**
 * @param {object} props
 * @param {object} props.conversation — ConversationDto
 * @param {boolean} props.selected
 * @param {boolean} props.isOnline
 * @param {() => void} props.onClick
 */
export default function ConversationCard({ conversation, selected, isOnline, onClick }) {
  const initials = (conversation.otherUserName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
    : null;

  return (
    <button
      onClick={onClick}
      className={`conv-card ${selected ? "conv-card-selected" : ""}`}
    >
      <div className="conv-avatar-wrap">
        <div className="conv-avatar">{initials}</div>
        {isOnline && <span className="online-dot" aria-label="Online" />}
      </div>

      <div className="conv-info">
        <div className="conv-top-row">
          <span className="conv-name">{conversation.otherUserName}</span>
          {timeAgo && <span className="conv-time">{timeAgo}</span>}
        </div>

        <div className="conv-bottom-row">
          <span className="conv-last-msg">
            {conversation.lastMessage || "No messages yet"}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="conv-unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
}