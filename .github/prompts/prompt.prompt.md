---
agent: agent
---

Build an Appwrite Cloud Function (Node.js) for a NEET/JEE AI app.

Context:
- This is Phase-1 MVP.
- Use ONLY Appwrite (no Express, no custom server).
- This function handles "Ask Doubt" AI logic.

Function Requirements:
- Input: JSON body with { userId, doubtText }
- Validate input (non-empty doubtText).
- Infer subject and topic from doubtText using simple AI inference.
- Save the user doubt to Appwrite Database collection "doubts":
    fields: userId, text, subject, topic, inferredDifficulty, createdAt
- Call Gemini API (Gemini-2.5-flash) with an exam-focused prompt:
    - Step-by-step explanation
    - Simple language
    - NEET/JEE oriented
- Save AI response to Appwrite Database collection "ai_responses":
    fields: doubtId, responseText, explanationStyle, responseLength, createdAt
- Return JSON response:
    { success: true, answer: responseText }

Technical Constraints:
- Use async/await.
- Use Appwrite Node SDK.
- Use environment variables for OpenAI API key and Appwrite credentials.
- Handle errors gracefully and return meaningful error messages.
- Do NOT use Express or any HTTP framework.
- Keep code clean, readable, and single-responsibility.

Bonus (if possible):
- Log a simple user event in "user_events" collection:
    { userId, eventType: "ASK_DOUBT", timestamp }

