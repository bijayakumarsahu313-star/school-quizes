
export type UserProfile = {
  uid: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  school: string;
  class?: string;
  createdAt: any; // Firestore Timestamp
};

export type Question = {
  question: string;
  options: string[];
  answer: string;
};

export type Quiz = {
  id: string;
  title: string;
  school: string;
  class: string;
  questions: Question[];
  createdBy: string;
  createdAt: any; // Firestore timestamp
};

export type Submission = {
  id: string;
  studentId: string;
  quizId: string;
  answers: Record<number, string>;
  score?: number;
  submittedAt: any; // Firestore Timestamp
}
