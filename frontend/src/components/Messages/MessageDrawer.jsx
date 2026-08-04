import { useState } from "react";
import { X, MessageCircle } from "lucide-react";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { conversations } from "./dummyData";

export default function MessageDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0]
  );

  // Total unread messages
  const unreadCount = conversations.reduce(
    (count, conversation) => count + (conversation.unread || 0),
    0
  );

  return (
    <>
      {/* Floating Inbox Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-orange-500 px-5 py-3 text-white shadow-[0_15px_40px_rgba(255,122,0,0.35)] transition-all duration-300 hover:scale-105 hover:bg-orange-600"
      >
        <div className="relative">
          <MessageCircle size={22} />

          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <span className="font-semibold">Inbox</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-5 right-5 bottom-5 z-50 w-[920px] max-w-[95vw]
        rounded-[36px]
        overflow-hidden
        bg-white/95
        backdrop-blur-xl
        shadow-[0_30px_90px_rgba(0,0,0,0.18)]
        transition-all
        duration-300
        ease-out
        ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-[110%] opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white/80 px-7 py-5 backdrop-blur">
          <h1 className="text-3xl font-bold">Inbox</h1>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 transition hover:bg-gray-100"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-82px)]">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelect={setSelectedConversation}
          />

          <ChatWindow conversation={selectedConversation} />
        </div>
      </div>
    </>
  );
}