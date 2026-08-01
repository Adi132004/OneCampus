export default function ConversationCard({
    conversation,
    selected,
    onClick,
  }) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-4 border-b transition
  
        ${
          selected
            ? "bg-orange-50 border-l-4 border-l-orange-500"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="h-12 w-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
          {conversation.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
  
        <div className="flex-1 text-left">
          <h3 className="font-semibold">
            {conversation.name}
          </h3>
  
          <p className="text-xs text-gray-500">
            {conversation.context}
          </p>
  
          <p className="text-sm text-gray-700 truncate">
            {conversation.item}
          </p>
        </div>
  
        {conversation.unread > 0 && (
          <div className="h-6 w-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
            {conversation.unread}
          </div>
        )}
      </button>
    );
  }