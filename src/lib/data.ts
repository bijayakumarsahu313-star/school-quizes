
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
