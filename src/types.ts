export type QuestionType = 'single' | 'multiple' | 'short_answer' | 'essay';

export interface Question {
  id: string;
  documentId: string;
  type: QuestionType;
  text: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
}

export interface DocumentCategory {
  id: string;
  title: string;
}

export type QuestionStatus = 'correct' | 'wrong' | 'unattempted';

export interface User {
  id: string;
  username: string;
  password?: string; // Simple password for local multi-user
  createdAt: number;
}

export interface UserRecord {
  userId: string;
  questionId: string;
  status: QuestionStatus;
  userAnswer?: string | string[];
  timestamp: number;
}

export interface Statistics {
  total: number;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  progress: number;
}
