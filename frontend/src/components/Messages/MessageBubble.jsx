export default function MessageBubble({ message }) {
    const mine = message.sender === "me";
  
    return (
      <div
        className={`flex mb-3 ${
          mine ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm
  
          ${
            mine
              ? "bg-orange-500 text-white rounded-br-md"
              : "bg-white text-gray-800 rounded-bl-md"
          }`}
        >
          <p>{message.text}</p>
  
          <span
            className={`mt-2 block text-right text-xs ${
              mine
                ? "text-orange-100"
                : "text-gray-400"
            }`}
          >
            {message.time}
          </span>
        </div>
      </div>
    );
  }