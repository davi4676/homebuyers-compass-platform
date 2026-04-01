/**
 * Fallback response templates — used when retrieval is empty or validation fails.
 */

export const FALLBACKS = {
  noReliableInfo:
    "That's not something I have reliable data on right now — I wouldn't want to guess on something this important. Here's what I'd recommend: check the Playbooks section in NestQuest for detailed guides, or connect with a loan officer or buyer's agent who can give you a personalized answer.",

  mortgageRates:
    "Mortgage rates change daily and vary based on your credit profile, loan type, and lender — I can't give you a live number. The best place to get accurate rates is through NestQuest's lender connection or rate comparison tools. What I can help with is explaining what affects your rate and how to compare offers.",

  overwhelmed:
    "Totally understandable — this process has a lot of moving parts. Let's take it one step at a time. The single most important thing you can do right now is get pre-approved so you know your budget. Want to start there?",

  escalateToHuman:
    "You've asked something that really deserves a personalized answer from a professional who can look at your full picture. Would you like me to connect you with a loan officer or buyer's agent? No obligation — just a conversation.",

  emptyRetrieval:
    "I don't have that specific information in my knowledge base right now — I wouldn't want to guess. Here's what I'd recommend: check the Playbooks section for guides on that topic, or I can connect you with a professional who can give you a personalized answer. What would help most?",
} as const
