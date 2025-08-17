export interface QuizItem {
  question: string;
  options: string[];
  answer: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  items: QuizItem[];
  creator: string;
  createdAt: string;
  responseCount?: number;
}

export enum AppStatus {
  IDLE,
  EXTRACTING,
  GENERATING,
  READY,
  DONE,
  ERROR,
}
