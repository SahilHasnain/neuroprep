import type { Note as NoteType } from "@/lib/types";

export class Note implements NoteType {
  constructor(
    public id: string,
    public title: string,
    public subject: string,
    public content: string,
    public date: string
  ) {}

  static fromStorage(data: any): Note {
    return new Note(data.id, data.title, data.subject, data.content, data.date);
  }

  getWordCount(): number {
    return this.content.split(/\s+/).filter(word => word.length > 0).length;
  }

  getReadingTime(): number {
    return Math.ceil(this.getWordCount() / 200); // minutes (200 words per minute)
  }

  getPreview(maxLength: number = 100): string {
    if (this.content.length <= maxLength) return this.content;
    return this.content.substring(0, maxLength).trim() + "...";
  }
}
