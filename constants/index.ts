// API Endpoints
export const API_ENDPOINTS = {
  ASK_DOUBT: "https://693e61e0001e8e28c8e6.fra.appwrite.run",
  DOUBTS_HISTORY: "https://69492691002f35be1da1.fra.appwrite.run",
  GENERATE_QUESTIONS: "https://69423cba001540dea615.fra.appwrite.run",
  QUESTIONS_HISTORY: "https://694926d2000145b262a6.fra.appwrite.run",
  NOTES: "https://6942afbd002f2d29fdce.fra.appwrite.run",
  NOTES_HISTORY: "https://6949271d003661a0358a.fra.appwrite.run",
  CREATE_SUBSCRIPTION: "https://6947ac26001044e8e8ed.fra.appwrite.run",
  VERIFY_PAYMENT: "https://6947ac55003801e0a004.fra.appwrite.run",
  GET_PLAN_STATUS: "https://6947ac7f002a1d447604.fra.appwrite.run",
  CANCEL_SUBSCRIPTION: "https://6947acaf0021f3fbd316.fra.appwrite.run",
  // Documents endpoints (separate functions)
  DOCUMENTS_UPLOAD: "https://69541719002fc4f32810.fra.appwrite.run",
  DOCUMENTS_CHUNKED_UPLOAD:
    "https://69564444002726a42e94.fra.appwrite.run", // Update after deployment
  DOCUMENTS_GET_ALL: "https://6954179700045dd890d4.fra.appwrite.run",
  DOCUMENTS_GET_DETAIL: "https://695417e2001d46e74d6b.fra.appwrite.run",
  DOCUMENTS_DELETE: "https://69541808000216397dc9.fra.appwrite.run",
  PROCESS_OCR: "https://695607f20031b594e614.fra.appwrite.run", // Update this after deployment
  PROCESS_THUMBNAIL: "https://695644b4001690e61503.fra.appwrite.run"
};

// Subjects
export const SUBJECTS = [
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
  { label: "Mathematics", value: "mathematics" },
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

// Question Counts
export const QUESTION_COUNTS = [
  { label: "5 Questions", value: "5" },
  { label: "10 Questions", value: "10" },
  { label: "15 Questions", value: "15" },
  { label: "20 Questions", value: "20" },
];

// Note Lengths
export const NOTE_LENGTHS = [
  { label: "Brief (Key Points)", value: "brief" },
  { label: "Detailed (Comprehensive)", value: "detailed" },
  { label: "Exam Focused", value: "exam" },
];

// Plan Features
export const PLAN_FEATURES = [
  {
    text: "1 Doubt per day",
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: "1 Question set per day (Easy, max 5)",
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: "1 Note per day",
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: "Unlimited Doubts",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Unlimited Questions",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Unlimited Notes",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Priority Support",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Advanced Analytics",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Ad-Free Experience",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Offline Access",
    freeIncluded: false,
    proIncluded: true,
  },
];

// Razorpay Config
export const RAZORPAY_KEY_ID = "rzp_test_xxx"; // Replace with your key

// MVP Bypass Flag - Set to true to bypass authentication and subscription features
export const LAUNCH_V1_BYPASS = true;
