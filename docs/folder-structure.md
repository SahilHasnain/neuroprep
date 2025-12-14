/app
  _layout.tsx                  # Root layout
  (tabs)/
    _layout.tsx                # Tabs layout
    index.tsx                  # Home/Dashboard
    ask-doubt.tsx
    generate-questions.tsx
    notes.tsx
  globals.css

/components
  ui/
    Button.tsx
    Input.tsx
    Loader.tsx
  shared/
    Header.tsx
    Footer.tsx
    ChatBubble.tsx
    QuestionCard.tsx

/store
  userStore.ts
  sessionStore.ts

/services
  api.ts
  auth.ts
  ai.ts        # 🔥 recommended addition

/utils
  formatters.ts
  validators.ts
  constants.ts

/types
  index.ts

/hooks
  useAuth.ts
  useQuestions.ts
  useDoubt.ts   # 🔥 recommended addition

/assets
  images/
  fonts/

/appwrite
  /functions
