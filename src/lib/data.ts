
export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export type Quiz = {
  id: string;
  title: string;
  subject: string;
  school: string;
  class: string;
  questions: Question[];
  published: boolean;
  createdAt: any; // Firestore timestamp
};
