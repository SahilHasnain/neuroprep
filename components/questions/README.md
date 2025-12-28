# QuestionCard Component

The `QuestionCard` component displays a generated question with options, correct answer, and an "Ask Doubt" button that allows users to navigate to the ask-doubt screen with the question context pre-populated.

## Usage Example

```tsx
import QuestionCard from "@/components/questions/QuestionCard";
import { navigateToAskDoubtWithQuestion } from "@/utils/navigationHelpers";
import type { QuestionContext } from "@/lib/types";

// In your component
const handleAskDoubt = (context: QuestionContext) => {
  navigateToAskDoubtWithQuestion(context);
};

// Render the question card
<QuestionCard
  question={{
    id: "q1",
    questionText: "What is Newton's second law of motion?",
    options: ["F = ma", "F = mv", "F = m/a", "F = a/m"],
    correctAnswer: "A",
    explanation:
      "Newton's second law states that force equals mass times acceleration.",
  }}
  subject="Physics"
  topic="Newton's Laws"
  difficulty="Easy"
  onAskDoubt={handleAskDoubt}
/>;
```

## Props

- `question`: Object containing question details
  - `id`: Unique question identifier
  - `questionText`: The question text (supports markdown/math)
  - `options`: Array of option strings
  - `correctAnswer`: Letter of correct answer (A, B, C, D)
  - `explanation`: Optional explanation text
- `subject`: Subject name (e.g., "Physics")
- `topic`: Topic name (e.g., "Newton's Laws")
- `difficulty`: Difficulty level (e.g., "Easy", "Medium", "Hard")
- `onAskDoubt`: Callback function that receives QuestionContext when user taps "Ask Doubt"

## Integration with Existing Question Display

To integrate with the existing question display system, you'll need to:

1. Convert the existing `Question` type to match the QuestionCard format
2. Extract options as string array from the options objects
3. Pass the appropriate subject, topic, and difficulty from the question set

Example:

```tsx
import QuestionCard from "@/components/questions/QuestionCard";
import { navigateToAskDoubtWithQuestion } from "@/utils/navigationHelpers";

// Convert existing question format
const convertedQuestion = {
  id: question.id,
  questionText: question.question,
  options: question.options.map((opt) => opt.text),
  correctAnswer: question.correctAnswer,
  explanation: undefined, // Not available in current backend
};

<QuestionCard
  question={convertedQuestion}
  subject={questionSet.subject}
  topic={questionSet.topic}
  difficulty={questionSet.difficulty}
  onAskDoubt={navigateToAskDoubtWithQuestion}
/>;
```

## Features

- Displays question with markdown/math support
- Shows all options with visual indicators
- Highlights correct answer in green
- Optional explanation section
- "Ask Doubt" button that navigates to ask-doubt screen with context
- Graceful error handling for navigation failures
