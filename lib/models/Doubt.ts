import type { Doubt as DoubtType, Message } from "@/lib/types";

export class Doubt implements DoubtType {
  constructor(
    public id: string,
    public text: string,
    public answer: string | undefined,
    public createdAt: string
  ) {}

  static fromStorage(data: any): Doubt {
    return new Doubt(data.id, data.text, data.answer, data.createdAt);
  }

  toMessages(): Message[] {
    const messages: Message[] = [];
    const timeStamp = new Date(this.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messages.push({
      id: this.id + "_q",
      text: this.text,
      isUser: true,
      timeStamp,
    });

    if (this.answer) {
      messages.push({
        id: this.id + "_a",
        text: this.answer,
        isUser: false,
        timeStamp,
      });
    }

    return messages;
  }
}
