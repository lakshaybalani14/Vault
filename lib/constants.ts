// ============================================================
// Vault — Application Constants
// ============================================================

export const CAMPUS_LOCATIONS_GROUPED = [
  {
    category: "Academic Buildings",
    locations: [
      "SJT", "TT", "PRP", "MB", "SMV", "GDN", "CDMM", "Architecture Block"
    ]
  },
  {
    category: "Men's Hostel",
    locations: [
      "MH - A Block", "MH - B Block", "MH - C Block", "MH - D Block", 
      "MH - E Block", "MH - F Block", "MH - G Block", "MH - H Block", 
      "MH - J Block", "MH - K Block", "MH - L Block", "MH - M Block", 
      "MH - N Block", "MH - O Block", "MH - P Block", "MH - Q Block", 
      "MH - R Block", "MH - T Block", 
      "One Food World", "Enzo", "Bakewell", "Men's Swimming Pool", 
      "RGMart", "Men's Gym", "Aavin"
    ]
  },
  {
    category: "Women's Hostel",
    locations: [
      "WH - A Block", "WH - B Block", "WH - C Block", "WH - D Block", 
      "WH - E Block", "WH - F Block", "WH - G Block", "WH - H Block", 
      "WH - I Block", "WH - J Block", "WH - S Block"
    ]
  },
  {
    category: "Others",
    locations: [
      "DC Bakery", "Dominos", "Amazon Depot", "PRP Food Court", 
      "Foodys", "Amul", "TT Basketball Ground", "Anna Audi", 
      "CS Hall", "MB Tennis Ground", "GDN Canteen", "All Mart", 
      "Main Gate", "Volleyball Court", "Greenos", "Woodys", 
      "Sales Room", "SMV Pathway", "PRP Pathway", "Balaji", 
      "FC", "Gate 3A", "Gate 2A", "Parking Area", "Hospital", 
      "Gate 1A", "Flag Spot", "Lassi Zone", "Central Library", 
      "SJT Pathway", "Other (Specify in description)"
    ]
  }
] as const;

export const CAMPUS_LOCATIONS = CAMPUS_LOCATIONS_GROUPED.flatMap(g => g.locations);

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
