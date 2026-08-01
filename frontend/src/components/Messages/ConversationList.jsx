import { useMemo, useState } from "react";
import ConversationCard from "./ConversationCard";

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelect,
}) {
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const q = search.toLowerCase();

      return (
        conversation.name.toLowerCase().includes(q) ||
        conversation.item.toLowerCase().includes(q) ||
        conversation.context.toLowerCase().includes(q)
      );
    });
  }, [search, conversations]);

  return (
    <div className="w-80 border-r bg-white flex flex-col">

      <div className="border-b p-5">

        <h2 className="text-2xl font-bold">
          Inbox
        </h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="mt-4 w-full rounded-full border px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500"
        />

      </div>

      <div className="flex-1 overflow-y-auto">

        {filteredConversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            selected={
              selectedConversation?.id === conversation.id
            }
            onClick={() => onSelect(conversation)}
          />
        ))}

      </div>

    </div>
  );
}