export interface User {
  id: string;
  name: string;
  email: string;
  refreshToken?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  quiz?: Quiz | null;
  quizId?: string | null;
}

export interface Quiz {
  id: string;
  name: string;
  description?: string | null;
  questions: Question[];
  responses: UserResponse[];
  createdAt: Date;
  updatedAt: Date;
  AbandonEvent: AbandonEvent[];
  user: User[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number | string;
  quizId: string;
  quiz: Quiz;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  quizId: string;
  quiz: Quiz;
  results: boolean[];
  name: string;
  email: string;
  totalCorrectAnswers: number;
  abandoned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbandonEvent {
  id: string;
  userId: string;
  quizId: string;
  quiz: Quiz;
  createdAt: Date;
}
