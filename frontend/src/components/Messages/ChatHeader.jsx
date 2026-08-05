/**
 * @param {object} props
 * @param {object} props.conversation — ConversationDto from backend
 * @param {boolean} props.isOnline
 */
export default function ChatHeader({ conversation, isOnline }) {
  if (!conversation) return null;

  const initials = (conversation.otherUserName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="chat-header">
      <div className="chat-header-avatar">
        <span>{initials}</span>
        {isOnline && <span className="online-dot online-dot-header" aria-label="Online" />}
      </div>

      <div className="chat-header-info">
        <h2 className="chat-header-name">{conversation.otherUserName}</h2>
        <p className="chat-header-status">
          {isOnline ? (
            <span className="status-online">● Online</span>
          ) : (
            <span className="status-offline">● Offline</span>
          )}
        </p>
      </div>
    </div>
  );
}