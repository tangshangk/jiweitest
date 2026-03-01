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
