export type UploadedDoc = {
  id: string;
  title: string;
  kind: 'pdf' | 'ppt' | 'docx' | 'notes';
  content: string;
  uploadedAt: number;
  size: number;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Summary = {
  overview: string;
  keyPoints: string[];
  formulas: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
};

export type StudyPlanDay = {
  day: number;
  title: string;
  tasks: string[];
};

export type StudyPlan = {
  goal: string;
  days: StudyPlanDay[];
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

export type Concept = {
  term: string;
  explanation: string;
};
