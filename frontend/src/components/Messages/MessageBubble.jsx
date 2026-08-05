import { Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * @param {object} props
 * @param {object} props.message — MessageDto from backend
 * @param {string} props.currentUserId — logged-in user's UUID
 */
export default function MessageBubble({ message, currentUserId }) {
  const mine = message.senderId === currentUserId;

  const time = message.timestamp
    ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
    : "";

  return (
    <div
      className={`msg-bubble-wrapper ${mine ? "msg-mine" : "msg-theirs"}`}
    >
      <div className={`msg-bubble ${mine ? "msg-bubble-mine" : "msg-bubble-theirs"}`}>
        <p className="msg-text">{message.message}</p>

        <div className="msg-meta">
          <span className="msg-time">{time}</span>
          {mine && (
            <span className="msg-receipt" title={message.read ? "Seen" : message.delivered ? "Delivered" : "Sent"}>
              {message.read ? (
                <CheckCheck size={14} className="receipt-seen" />
              ) : message.delivered ? (
                <CheckCheck size={14} className="receipt-delivered" />
              ) : (
                <Check size={14} className="receipt-sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}