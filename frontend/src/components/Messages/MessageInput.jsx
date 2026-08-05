import { Send, Smile } from "lucide-react";
import { useRef, useState } from "react";

const EMOJI_LIST = ["😊", "👍", "❤️", "😂", "🙏", "🔥", "✅", "🎉", "💯", "😅"];

/**
 * @param {object} props
 * @param {(text: string) => void} props.onSend
 * @param {boolean} [props.disabled]
 */
export default function MessageInput({ onSend, disabled = false }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e) {
    setText(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }

  function insertEmoji(emoji) {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="msg-input-bar">
      {showEmoji && (
        <div className="emoji-picker">
          {EMOJI_LIST.map((e) => (
            <button
              key={e}
              onClick={() => insertEmoji(e)}
              className="emoji-btn"
              type="button"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="msg-input-row">
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="emoji-toggle"
          aria-label="Emoji picker"
        >
          <Smile size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          disabled={disabled}
          className="msg-textarea"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="msg-send-btn"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}