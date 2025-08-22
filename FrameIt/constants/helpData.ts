// FAQ Data
export const faqData = [
  {
    id: 1,
    question: "How do I complete a challenge?",
    answer:
      "To complete a challenge, navigate to the location shown on the map, take a photo that meets the requirements, and submit it through the app. Make sure you're within the required radius of the location.",
    category: "Challenges",
    icon: "flag",
  },
  {
    id: 2,
    question: "Why can't I see new challenges?",
    answer:
      "New challenges may not appear if: 1) You don't have location permissions enabled, 2) There are no active challenges in your area, 3) You've already completed all available challenges. Check your settings and try refreshing the app.",
    category: "Challenges",
    icon: "refresh",
  },
  {
    id: 3,
    question: "How does the XP system work?",
    answer:
      "You earn XP (Experience Points) by completing challenges, voting on submissions, and achieving streaks. Different challenges offer different XP rewards based on difficulty. XP helps you level up and unlock new features.",
    category: "Progress",
    icon: "trophy",
  },
  {
    id: 4,
    question: "Can I change my display name?",
    answer:
      "Yes! Go to Settings > Account Information and slide the 'Display Name' option to edit it. Your display name must be unique and follow our community guidelines.",
    category: "Account",
    icon: "person",
  },
  {
    id: 5,
    question: "How do I add friends?",
    answer:
      "You can add friends by searching for their display name in the Friends section, or by sharing your profile with them. Make sure your privacy settings allow friend requests.",
    category: "Social",
    icon: "people",
  },
  {
    id: 6,
    question: "What if my photo submission is rejected?",
    answer:
      "Photos may be rejected if they don't meet the challenge requirements, are inappropriate, or don't show the required location/subject. You can retry the challenge with a new photo that better meets the criteria.",
    category: "Submissions",
    icon: "camera",
  },
  {
    id: 7,
    question: "How do I enable location services?",
    answer:
      "Go to your device Settings > Apps > FrameIt > Permissions > Location and enable 'Allow all the time' or 'Allow while using app'. Location access is required for location-based challenges.",
    category: "Technical",
    icon: "location",
  },
  {
    id: 8,
    question: "Why is the app running slowly?",
    answer:
      "Try these steps: 1) Close and restart the app, 2) Check your internet connection, 3) Clear the app cache, 4) Make sure you have enough storage space, 5) Update to the latest version.",
    category: "Technical",
    icon: "speedometer",
  },
];

// Support Categories
export const supportCategories = [
  {
    id: "account",
    title: "Account & Profile",
    icon: "person-circle",
    color: "#007AFF",
    description: "Manage your account settings and profile",
  },
  {
    id: "challenges",
    title: "Challenges & Quests",
    icon: "flag",
    color: "#34C759",
    description: "Help with completing and finding challenges",
  },
  {
    id: "technical",
    title: "Technical Issues",
    icon: "bug",
    color: "#FF3B30",
    description: "App performance and technical problems",
  },
  {
    id: "social",
    title: "Friends & Social",
    icon: "people",
    color: "#AF52DE",
    description: "Connect with friends and social features",
  },
  {
    id: "privacy",
    title: "Privacy & Safety",
    icon: "shield",
    color: "#FF9500",
    description: "Privacy settings and safety guidelines",
  },
  {
    id: "feedback",
    title: "Feedback & Suggestions",
    icon: "chatbubble",
    color: "#32D74B",
    description: "Share your ideas and feedback with us",
  },
];
