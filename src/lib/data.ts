
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
  createdAt: any; // Firestore timestamp
};
