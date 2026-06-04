// ============================================================
// Vault — Application Constants
// ============================================================

export const CAMPUS_LOCATIONS = [
  "Main Gate",
  "SJT Block",
  "MB Block",
  "GDN Block",
  "SMV Block",
  "TT Auditorium",
  "Central Library",
  "Cafeteria (Main)",
  "Cafeteria (North)",
  "Men's Hostel (A-Block)",
  "Men's Hostel (B-Block)",
  "Men's Hostel (C-Block)",
  "Women's Hostel",
  "Sports Complex",
  "Swimming Pool",
  "Biotech Block",
  "Mechanical Block",
  "Civil Block",
  "Technology Tower",
  "Admin Block",
  "Health Centre",
  "Parking Area (SJT)",
  "Parking Area (MB)",
  "VIT Post Office",
  "Other (specify in description)",
] as const;

export const CATEGORIES = [
  { value: 'Electronics', emoji: '🎧', label: 'Electronics' },
  { value: 'ID Card', emoji: '🪪', label: 'ID Card' },
  { value: 'Keys', emoji: '🔑', label: 'Keys' },
  { value: 'Bag', emoji: '👜', label: 'Bag' },
  { value: 'Books', emoji: '📚', label: 'Books' },
  { value: 'Clothing', emoji: '👕', label: 'Clothing' },
  { value: 'Wallet', emoji: '👛', label: 'Wallet' },
  { value: 'Water Bottle', emoji: '💧', label: 'Water Bottle' },
  { value: 'Other', emoji: '📦', label: 'Other' },
] as const;

export const QUESTION_TEMPLATES = {
  lost: [
    "Where exactly did you find it?",
    "What condition is it in now?",
    "Was anything inside it when you found it?",
    "Is anything damaged or missing?",
  ],
  found: [
    "What is written or engraved on it?",
    "What stickers or marks are on it?",
    "What colour is the inside / lining?",
    "What is the name written inside?",
  ],
} as const;

export const MEETUP_SPOTS = [
  "Main Gate",
  "Library Ground Floor",
  "TT Auditorium Entrance",
  "Men's Hostel Lobby",
  "Women's Hostel Lobby",
  "SJT Ground Floor",
  "MB Ground Floor",
  "Cafeteria",
  "Sports Complex",
] as const;

export const ALLOWED_DOMAINS = ['vitstudent.ac.in', 'vit.ac.in'];

export const MAX_IMAGES = 3;
export const MAX_IMAGE_SIZE_MB = 0.8;
export const MAX_IMAGE_DIMENSION = 1280;
export const SECRET_ANSWER_MIN_LENGTH = 1;
export const CLAIM_MESSAGE_MIN_LENGTH = 20;
export const MAX_CLAIM_ATTEMPTS = 3;
export const LOCKOUT_HOURS = 24;
