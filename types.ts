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

// serverTimestampから返されるオブジェクトの型定義
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Feedback {
  id: string;
  reporterName: string;
  type: '機能要望' | 'バグ';
  content: string;
  createdAt: FirestoreTimestamp;
}
