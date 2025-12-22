# Contextual Doubt History for Pro Users

## Feature Overview
Pro users get AI memory of their last **5 doubts** for personalized, contextual answers.

## How It Works
- AI remembers last 5 doubts per user
- References past doubts when relevant (e.g., "Remember when you asked about Newton's laws? This relates to that...")
- Automatic cleanup - only keeps most recent 5

## Database Schema

### New Table: `doubt_history`
```
- userId (string, indexed)
- doubtText (string)
- subject (string)
- topic (string)
- timestamp (datetime)
- aiAnswerId (string)
```

## Backend Changes

### `neuroprep-backend/askDoubt/index.js`
1. Accept `isPro` flag in request
2. If pro user:
   - Fetch last 5 doubts from `doubt_history`
   - Pass to AI prompt
   - Save current doubt after response
   - Delete doubts beyond 5

### `neuroprep-backend/askDoubt/ai.js`
- Enhanced prompt includes doubt history context
- AI instructed to reference past doubts when relevant

### Environment Variable
```
APPWRITE_DOUBT_HISTORY_TABLE_ID=<table_id>
```

## Frontend Changes

### `neuroprep-frontend/app/(tabs)/ask-doubt.tsx`
- Pass `isPro` flag from user's plan status in fetch request
- No UI changes - AI naturally references history in responses

## Why 5 Doubts?
- **Context**: Enough for meaningful connections
- **Performance**: ~2.5K tokens, fast API responses
- **Relevance**: Recent learning focus
- **Cost**: Manageable Gemini API usage

## Implementation Checklist
- [ ] Create `doubt_history` table in Appwrite
- [ ] Add `APPWRITE_DOUBT_HISTORY_TABLE_ID` to backend `.env`
- [ ] Update `askDoubt/index.js` with history logic
- [ ] Update `askDoubt/ai.js` prompt
- [ ] Update frontend to pass `isPro` flag
- [ ] Test with pro user account

## Future Enhancements
- UI badge: "AI remembers your last 5 doubts"
- User control to clear history
- Increase to 10 for premium tier
