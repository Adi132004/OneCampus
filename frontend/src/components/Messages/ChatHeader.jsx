export default function ChatHeader({ conversation }) {
    if (!conversation) return null;
  
    return (
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {conversation.name}
          </h2>
  
          <p className="text-sm text-gray-500">
            {conversation.context} • {conversation.item}
          </p>
        </div>
  
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
      </div>
    );
  }