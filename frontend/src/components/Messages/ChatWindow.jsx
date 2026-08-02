import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversation }) {
  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Select a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-100">

      <ChatHeader conversation={conversation} />

      <div className="flex-1 overflow-y-auto p-6">

        {conversation.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

      </div>

      <MessageInput />

    </div>
  );
}