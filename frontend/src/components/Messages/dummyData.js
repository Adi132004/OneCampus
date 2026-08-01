export const conversations = [
    {
      id: 1,
      name: "Rahul Sharma",
      context: "Marketplace",
      item: "MacBook Air M2",
      unread: 2,
      lastMessage: "Is it still available?",
      messages: [
        {
          id: 1,
          sender: "other",
          text: "Hi, is it still available?",
          time: "10:20 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "Yes, it is available.",
          time: "10:21 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Aditya Singh",
      context: "Lost & Found",
      item: "Wallet",
      unread: 0,
      lastMessage: "Thanks for helping!",
      messages: [
        {
          id: 1,
          sender: "other",
          text: "Thank you!",
          time: "Yesterday",
        },
        {
          id: 2,
          sender: "me",
          text: "You're welcome 😊",
          time: "Yesterday",
        },
      ],
    },
  ];