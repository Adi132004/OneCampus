import { Send } from "lucide-react";
import { useState } from "react";

export default function MessageInput() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex items-center gap-3 border-t bg-white p-4">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-full border px-5 py-3 outline-none focus:ring-2 focus:ring-orange-400"
      />

      <button
        className="rounded-full bg-orange-500 p-3 text-white transition hover:bg-orange-600"
      >
        <Send size={18} />
      </button>
    </div>
  );
}