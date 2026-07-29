export const PRODUCTS = [
  {
    id: "1",
    title: "DSA Textbook (Cormen)",
    price: 450,
    category: "Books",
    condition: "Like new",
    seller: "Aarav S.",
    college: "IIT Bombay",
    postedAt: "2h ago",
    emoji: "📘",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80",
    description: "Barely used. Perfect for algorithm prep.",
    featured: true,
  },
  {
    id: "2",
    title: "Scientific Calculator",
    price: 350,
    category: "Electronics",
    condition: "Good",
    seller: "Meera K.",
    college: "Delhi University",
    postedAt: "5h ago",
    emoji: "🧮",
    image:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80",
    description: "Casio fx-991ES Plus. Works perfectly.",
  },
  {
    id: "3",
    title: "Mountain Bike",
    price: 6500,
    category: "Vehicles",
    condition: "Used",
    seller: "Rohan P.",
    college: "BITS Pilani",
    postedAt: "1d ago",
    emoji: "🚲",
    image:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=800&auto=format&fit=crop&q=80",
    description: "21 gears, well maintained. Great for campus.",
    featured: true,
  },
  {
    id: "4",
    title: "Study Lamp",
    price: 600,
    category: "Furniture",
    condition: "Like new",
    seller: "Priya N.",
    college: "VIT Vellore",
    postedAt: "3h ago",
    emoji: "💡",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    description: "Warm-light LED with dimmer.",
  },
  {
    id: "5",
    title: "Wireless Headphones",
    price: 2200,
    category: "Electronics",
    condition: "Good",
    seller: "Ishaan T.",
    college: "NIT Trichy",
    postedAt: "8h ago",
    emoji: "🎧",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    description: "Sony WH-CH510, great battery life.",
    featured: true,
  },
  {
    id: "6",
    title: "Mini Fridge",
    price: 4500,
    category: "Appliances",
    condition: "Used",
    seller: "Sara L.",
    college: "IIT Delhi",
    postedAt: "2d ago",
    emoji: "🧊",
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80",
    description: "Perfect for hostel room.",
  },
  {
    id: "7",
    title: "Acoustic Guitar",
    price: 3200,
    category: "Music",
    condition: "Good",
    seller: "Kabir M.",
    college: "BITS Pilani",
    postedAt: "6h ago",
    emoji: "🎸",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80",
    description: "Yamaha F310, with case.",
  },
  {
    id: "8",
    title: "Lab Coat (Size M)",
    price: 250,
    category: "Clothing",
    condition: "New",
    seller: "Anaya R.",
    college: "IIT Bombay",
    postedAt: "12h ago",
    emoji: "🥼",
    image:
      "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&auto=format&fit=crop&q=80",
    description: "Unworn, tags on.",
  },
];
export const CATEGORIES = [
  "All",
  "Books",
  "Electronics",
  "Vehicles",
  "Furniture",
  "Appliances",
  "Music",
  "Clothing",
];
const CUSTOM_LOST_ITEMS_KEY = "onecampus-custom-lost-items";

export const LOST_ITEMS = [];

export function formatLostItemDate(value) {
  if (!value) return "Unknown date";

  const text = String(value).trim();
  if (text === "Today" || text === "Yesterday") return text;
  if (/^\d+\s+days?\s+ago$/i.test(text)) return text;
  if (/^\d+\s+weeks?\s+ago$/i.test(text)) return text;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(parsed);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - target) / 86_400_000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return parsed.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function readCustomLostItems() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CUSTOM_LOST_ITEMS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLostItems() {
  return [...LOST_ITEMS, ...readCustomLostItems()];
}

export function addLostItem(item) {
  if (typeof window === "undefined") return getLostItems();

  const nextItems = [item, ...readCustomLostItems()];
  window.localStorage.setItem(CUSTOM_LOST_ITEMS_KEY, JSON.stringify(nextItems));
  return getLostItems();
}

export function updateLostItem(updatedItem) {
  if (typeof window === "undefined") return getLostItems();

  const nextItems = readCustomLostItems().map((item) => (item.id === updatedItem.id ? updatedItem : item));
  window.localStorage.setItem(CUSTOM_LOST_ITEMS_KEY, JSON.stringify(nextItems));
  return getLostItems();
}

export function deleteLostItem(id) {
  if (typeof window === "undefined") return getLostItems();

  const nextItems = readCustomLostItems().filter((item) => item.id !== id);
  window.localStorage.setItem(CUSTOM_LOST_ITEMS_KEY, JSON.stringify(nextItems));
  return getLostItems();
}

export const TEAM = [
  {
    name: "Prathmesh Palkurtiwar",
    role: "Founder & Full-Stack Engineer",
    bio: "Shapes the platform end-to-end, from architecture to interface polish.",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Rishi Mishra",
    role: "Backend & Infrastructure",
    bio: "Keeps the APIs fast, reliable, and ready for every campus workflow.",
    photo: "https://randomuser.me/api/portraits/men/36.jpg",
  },
  {
    name: "Ketan Botre",
    role: "Frontend & Design Systems",
    bio: "Turns product ideas into smooth, responsive student experiences.",
    photo: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    name: "Aditya Shahane",
    role: "Product & Community",
    bio: "Connects with students so oneCampus stays practical and useful.",
    photo: "https://randomuser.me/api/portraits/men/51.jpg",
  },
  {
    name: "Omkar Burade",
    role: "Realtime Chat Engineer",
    bio: "Builds the messaging experience that keeps campus conversations moving.",
    photo: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];
export const CONVERSATIONS = [
  {
    id: "c1",
    name: "Aarav S.",
    initials: "AS",
    last: "Is the textbook still available?",
    time: "2m",
    online: true,
    unread: 2,
  },
  {
    id: "c2",
    name: "Meera K.",
    initials: "MK",
    last: "Cool, see you at the library!",
    time: "1h",
    online: true,
  },
  {
    id: "c3",
    name: "CS Study Group",
    initials: "CS",
    last: "Priya: notes uploaded ✅",
    time: "3h",
    online: false,
    unread: 5,
  },
  {
    id: "c4",
    name: "Rohan P.",
    initials: "RP",
    last: "Thanks for the bike pics",
    time: "1d",
    online: false,
  },
  {
    id: "c5",
    name: "Hostel C — Floor 3",
    initials: "H3",
    last: "Power's back 💡",
    time: "2d",
    online: false,
  },
];
export const MESSAGES = [
  {
    id: 1,
    mine: false,
    text: "Hey! Saw your DSA textbook listing — still available?",
    time: "10:14",
  },
  {
    id: 2,
    mine: true,
    text: "Yes, still available!",
    time: "10:15",
  },
  {
    id: 3,
    mine: false,
    text: "Awesome. Can we meet at the library tomorrow?",
    time: "10:15",
  },
  {
    id: 4,
    mine: true,
    text: "Sure, 4pm works for me. Ground floor entrance?",
    time: "10:16",
  },
  {
    id: 5,
    mine: false,
    text: "Perfect. See you then!",
    time: "10:17",
  },
];
