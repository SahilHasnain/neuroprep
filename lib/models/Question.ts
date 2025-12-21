import type { Question as QuestionType, QuestionOption } from "@/lib/types";

export class Question implements QuestionType {
  constructor(
    public id: string,
    public question: string,
    public options: QuestionOption[],
    public correctAnswer: string
  ) {}

  static fromApi(data: any): Question {
    return new Question(data.id, data.question, data.options, data.correctAnswer);
  }

  isCorrect(selectedAnswer: string): boolean {
    return selectedAnswer === this.correctAnswer;
  }

  getScore(selectedAnswer: string): number {
    return this.isCorrect(selectedAnswer) ? 1 : 0;
  }
}
