# NeuroPrep Frontend (Expo)

Backend Repository: [neuroprep-backend](../neuroprep-backend)

Expo Router + NativeWind mobile app for AI-first exam prep. Tabs cover doubts, question generation, notes, documents, flashcards, and subscription flows.

## Highlights

- Navigation lives under `app/_layout.tsx` and `app/(tabs)/`; screens include `ask-doubt`, `generate-questions`, `notes`, `documents`, `flashcards`, and `subscription`.
- Chat experiences render Markdown via `components/shared/ChatBubble.tsx`; math-friendly Markdown tweaks live in `components/shared/MathMarkdown.tsx`.
- Local persistence: question history and notes metadata are kept in AsyncStorage (see `app/(tabs)/generate-questions.tsx` and `utils/notesStorage.ts`).
- Appwrite integration uses `config/appwrite.ts` and `lib/appwrite.ts` for auth/storage; AI flows call Appwrite Cloud Function URLs directly from screens.
- Styling with NativeWind/Tailwind tokens; icons from `lucide-react-native` and `@expo/vector-icons`.

## Getting started

1. Install Node 18+ and npm (Expo CLI optional).
2. `cd neuroprep-frontend && npm install`.
3. Create a `.env` with `EXPO_PUBLIC_APPWRITE_ENDPOINT` and `EXPO_PUBLIC_APPWRITE_PROJECT_ID` values.
4. Run the app: `npm run start` (or `npm run android` / `npm run ios` / `npm run web`).

## Useful scripts

- `npm run start` – Expo dev server.
- `npm run android` / `npm run ios` / `npm run web` – platform targets.
- `npm run test`, `npm run test:watch`, `npm run test:coverage` – Jest suites.
- `npm run lint` – Expo ESLint config.
- `npm run reset-project` – cache/project reset helper.

## Data flow

- Screens hit Appwrite Cloud Function HTTP endpoints for AI outputs; responses are displayed as Markdown with mobile-safe styling.
- Math inline markers are converted to Unicode for readability on small screens (`MathMarkdown` helper).
- User-facing content (questions, notes labels) is cached locally with simple caps to avoid unbounded storage.

## Project layout

- `app/(tabs)/_layout.tsx` – tab shell, nested routes per screen.
- `components/shared/` – chat bubbles, math markdown, buttons, and other primitives.
- `config/` and `lib/` – configuration constants and Appwrite client wiring.
- `tailwind.config.js` – design tokens for NativeWind.
