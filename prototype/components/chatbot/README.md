# NQ Homebuying Chatbot

Self-contained chatbot widget for NestQuest. Requires login to use.

## Setup

Add to `.env.local`:

```
ANTHROPIC_API_KEY=your_api_key
```

## Files

- `HomebuyerChatbotWidget.tsx` — Floating widget + panel UI
- `ChatMessage.tsx` — Message bubble component
- `ChatInput.tsx` — Input + send
- `useChatSession.ts` — Client state + streaming API calls

Backend: `app/api/chat/route.ts`  
Knowledge: `lib/chatbot/`
