# Frontend Refactoring & Architecture Plan

## Current Issues Identified

1. **Business Logic in UI Components** - API calls, data formatting in screens
2. **No Service Layer** - Direct fetch calls scattered across components
3. **Inconsistent Error Handling** - Different patterns in each screen
4. **Type Safety Gaps** - Missing types for API responses, storage data
5. **Code Duplication** - Similar patterns in ask-doubt, questions, notes screens
6. **No Separation of Concerns** - UI, business logic, data access mixed

---

## **Phase 1: Service Layer & API Abstraction**

### Goal
Extract all API calls into dedicated service modules. Single source of truth for backend communication.

### Structure
```
services/
├── api/
│   ├── client.ts          # Axios/fetch wrapper with interceptors
│   ├── doubts.service.ts  # All doubt-related API calls
│   ├── questions.service.ts
│   ├── notes.service.ts
│   └── subscription.service.ts
└── storage/
    ├── doubts.storage.ts  # Already exists, just move
    ├── questions.storage.ts
    └── notes.storage.ts
```

### Implementation
**services/api/client.ts**
```ts
import { getIdentity } from "@/utils/identity";
import { API_ENDPOINTS } from "@/constants";

export class ApiClient {
  private async getHeaders() {
    const identity = await getIdentity();
    return {
      "Content-Type": "application/json",
      "x-identity-type": identity.type,
      "x-identity-id": identity.id,
    };
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 402) {
      throw new Error("LIMIT_REACHED");
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Request failed");
    }

    return data.data;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }
}

export const apiClient = new ApiClient();
```

**services/api/doubts.service.ts**
```ts
import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";

export interface DoubtResponse {
  doubtId: string;
  metadata: { subject: string; topic: string; difficulty: string };
  answer: {
    explanation: string[];
    intuition: string;
    revisionTip: string;
  };
}

export const doubtsService = {
  async askDoubt(doubtText: string): Promise<DoubtResponse> {
    return apiClient.post<DoubtResponse>(API_ENDPOINTS.ASK_DOUBT, { doubtText });
  },
};
```

### Changes
- Move all `fetch` calls from screens to services
- Screens only call service methods
- Centralized error handling
- Type-safe API responses

---

## **Phase 2: Custom Hooks for Business Logic**

### Goal
Extract business logic from screens into reusable hooks. Screens become pure UI.

### Structure
```
hooks/
├── useDoubts.ts
├── useQuestions.ts
├── useNotes.ts
├── useSubscription.ts
└── useAuth.ts
```

### Implementation
**hooks/useDoubts.ts**
```ts
import { useState, useEffect } from "react";
import { doubtsService } from "@/services/api/doubts.service";
import { doubtsStorage } from "@/services/storage/doubts.storage";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timeStamp: string;
}

export const useDoubts = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPastDoubts();
  }, []);

  const loadPastDoubts = async () => {
    const past = await doubtsStorage.load();
    // Transform and set messages
  };

  const askDoubt = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await doubtsService.askDoubt(text);
      // Format and add to messages
      await doubtsStorage.save(text, response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, askDoubt };
};
```

### Changes
- Screens use hooks instead of direct API calls
- All state management in hooks
- Reusable across components
- Easy to test

---

## **Phase 3: Type System & Data Models**

### Goal
Complete type coverage for all data structures. No `any` types.

### Structure
```
lib/
├── types/
│   ├── api.types.ts       # API request/response types
│   ├── domain.types.ts    # Business domain types
│   ├── storage.types.ts   # AsyncStorage data types
│   └── ui.types.ts        # Component prop types
└── models/
    ├── Doubt.ts
    ├── Question.ts
    ├── Note.ts
    └── Subscription.ts
```

### Implementation
**lib/types/api.types.ts**
```ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  plan?: string;
  limitInfo?: {
    used: number;
    limit: number;
    allowed: boolean;
  };
}

export interface DoubtRequest {
  doubtText: string;
}

export interface DoubtApiResponse {
  doubtId: string;
  metadata: {
    subject: string;
    topic: string;
    difficulty: string;
  };
  answer: {
    explanation: string[];
    intuition: string;
    revisionTip: string;
  };
}
```

**lib/models/Doubt.ts**
```ts
export class Doubt {
  constructor(
    public id: string,
    public text: string,
    public answer: string,
    public createdAt: Date
  ) {}

  static fromStorage(data: any): Doubt {
    return new Doubt(data.id, data.text, data.answer, new Date(data.createdAt));
  }

  toStorage() {
    return {
      id: this.id,
      text: this.text,
      answer: this.answer,
      createdAt: this.createdAt.toISOString(),
    };
  }

  toMessage() {
    return {
      id: this.id,
      text: this.text,
      isUser: true,
      timeStamp: this.createdAt.toLocaleTimeString(),
    };
  }
}
```

### Changes
- All API responses typed
- Domain models with transformation methods
- Type-safe storage operations
- Compile-time error catching

---

## **Phase 4: Screen Refactoring & Component Composition**

### Goal
Simplify screens to pure UI. Extract complex logic into smaller components.

### Structure
```
app/(tabs)/
├── ask-doubt/
│   ├── index.tsx          # Main screen (UI only)
│   ├── components/
│   │   ├── MessageList.tsx
│   │   ├── DoubtInput.tsx
│   │   └── DoubtHeader.tsx
│   └── hooks/
│       └── useDoubtScreen.ts
```

### Implementation
**app/(tabs)/ask-doubt/index.tsx** (After refactor)
```tsx
import { useDoubts } from "@/hooks/useDoubts";
import { MessageList } from "./components/MessageList";
import { DoubtInput } from "./components/DoubtInput";
import { DoubtHeader } from "./components/DoubtHeader";

export default function AskDoubtScreen() {
  const { messages, loading, askDoubt } = useDoubts();

  return (
    <SafeAreaView>
      <DoubtHeader />
      <MessageList messages={messages} loading={loading} />
      <DoubtInput onSend={askDoubt} />
    </SafeAreaView>
  );
}
```

### Changes
- Screens < 100 lines
- Single responsibility per component
- Easy to understand and maintain
- Testable components

---

## **Phase 5: Error Handling & Loading States**

### Goal
Consistent error handling and loading UX across the app.

### Structure
```
components/
├── feedback/
│   ├── ErrorBoundary.tsx
│   ├── ErrorMessage.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
└── hoc/
    └── withErrorHandler.tsx
```

### Implementation
**components/feedback/ErrorBoundary.tsx**
```tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**hooks/useApiCall.ts**
```ts
export const useApiCall = <T,>(apiFunc: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```

### Changes
- Global error boundary
- Consistent loading states
- Retry mechanisms
- User-friendly error messages

---

## Summary

| Phase | Focus | Files Changed | Time |
|-------|-------|---------------|------|
| 1 | Service Layer | ~10 new, 6 modified | 3-4h |
| 2 | Custom Hooks | ~5 new, 6 modified | 2-3h |
| 3 | Type System | ~8 new, 10 modified | 2-3h |
| 4 | Screen Refactor | ~15 new, 6 modified | 4-5h |
| 5 | Error Handling | ~5 new, all modified | 2h |

**Total: 12-17 hours**

## Benefits

✅ **Maintainability** - Clear separation of concerns
✅ **Testability** - Pure functions, isolated logic
✅ **Scalability** - Easy to add new features
✅ **Type Safety** - Catch errors at compile time
✅ **Code Reuse** - Shared hooks and services
✅ **Developer Experience** - Easier onboarding

## Migration Strategy

1. Implement Phase 1 (services) alongside existing code
2. Gradually migrate screens to use services
3. Add hooks one screen at a time
4. Complete types incrementally
5. Refactor screens after hooks are stable
6. Add error handling last (wraps everything)

**No breaking changes. Incremental migration.**
