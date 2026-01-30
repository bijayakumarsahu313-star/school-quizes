
export type UserProfile = {
  uid: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher';
  school: string;
  classLevel?: number;
  board?: string;
  subject?: string;
  plan?: 'free' | 'pro';
  planType?: 'monthly' | 'yearly';
  planExpires?: any; // Firestore Timestamp
};

export type Student = {
  id: string;
  name: string;
  class: string;
  avatar: string;
  averageScore: number;
  quizzesCompleted: number;
};

export type Question = {
  text: string;
  options: string[];
  answer: string;
};

export type Quiz = {
  id: string;
  title: string;
  subject: string;
  classLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: string;
  numberOfQuestions: number;
  questions: Question[];
  createdBy: string;
  createdAt: any; // Firestore timestamp
  status: 'Draft' | 'Published';
  duration: number; // Duration in minutes
  averageScore?: number;
};

export type QuizResult = {
  id: string;
  quizId: string;
  userId: string;
  studentName: string;
  studentAvatar: string;
  score: number;
  completedAt: any; // Firestore Timestamp
  answers: Record<number, string>;
}

export const students: Student[] = [
  { id: '1', name: 'Aarav Sharma', class: '10A', avatar: 'https://picsum.photos/seed/s1/40/40', averageScore: 85, quizzesCompleted: 12 },
  { id: '2', name: 'Priya Patel', class: '10A', avatar: 'https://picsum.photos/seed/s2/40/40', averageScore: 92, quizzesCompleted: 15 },
  { id: '3', name: 'Rohan Gupta', class: '9B', avatar: 'https://picsum.photos/seed/s3/40/40', averageScore: 78, quizzesCompleted: 10 },
  { id: '4', name: 'Sneha Reddy', class: '11C', avatar: 'https://picsum.photos/seed/s4/40/40', averageScore: 88, quizzesCompleted: 14 },
  { id: '5', name: 'Vikram Singh', class: '12A', avatar: 'https://picsum.photos/seed/s5/40/40', averageScore: 95, quizzesCompleted: 18 },
];

export const quizzes: Quiz[] = [
  { 
    id: '1', 
    title: 'Algebra Basics', 
    subject: 'Math', 
    classLevel: 8, 
    numberOfQuestions: 2, 
    averageScore: 82, 
    status: 'Published',
    duration: 5,
    questions: [
        {
            text: "What is the value of x in the equation 2x + 3 = 7?",
            options: ["1", "2", "3", "4"],
            answer: "2"
        },
        {
            text: "Simplify the expression: 3(x + 4) - 2x",
            options: ["x + 12", "5x + 12", "x - 4", "x + 4"],
            answer: "x + 12"
        }
    ],
    createdBy: 'teacher-uid-1',
    createdAt: new Date(),
    difficulty: 'easy',
    questionType: 'MCQ'
  },
  { 
    id: '2', 
    title: 'Indian Independence Movement', 
    subject: 'Social Studies', 
    classLevel: 10, 
    numberOfQuestions: 2, 
    averageScore: 88, 
    status: 'Published',
    duration: 5,
    questions: [
        { text: "When did India get its independence?", options: ["1945", "1947", "1950", "1942"], answer: "1947"},
        { text: "Who was the first Prime Minister of India?", options: ["Mahatma Gandhi", "Sardar Patel", "Jawaharlal Nehru", "B. R. Ambedkar"], answer: "Jawaharlal Nehru"}
    ],
    createdBy: 'teacher-uid-1',
    createdAt: new Date(),
    difficulty: 'medium',
    questionType: 'MCQ'
  },
  { 
    id: '3', 
    title: 'Cell Biology', 
    subject: 'Science', 
    classLevel: 9, 
    numberOfQuestions: 2, 
    averageScore: 76, 
    status: 'Published',
    duration: 10,
    questions: [
        { text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"], answer: "Mitochondrion"},
        { text: "Which organelle is responsible for photosynthesis?", options: ["Mitochondrion", "Chloroplast", "Vacuole", "Golgi apparatus"], answer: "Chloroplast"}
    ],
    createdBy: 'teacher-uid-2',
    createdAt: new Date(),
    difficulty: 'medium',
    questionType: 'MCQ'
  },
  { id: '4', title: 'Shakespeare\'s Sonnets', subject: 'English', classLevel: 11, numberOfQuestions: 10, averageScore: 91, status: 'Draft', duration: 15, questions: [], createdBy: 'teacher-uid-2', createdAt: new Date(), difficulty: 'hard', questionType: 'MCQ' },
  { 
    id: '5', 
    title: 'Chemical Reactions', 
    subject: 'Science', 
    classLevel: 10, 
    numberOfQuestions: 2, 
    averageScore: 85, 
    status: 'Published',
    duration: 5,
    questions: [
        { text: "What is the chemical formula for water?", options: ["H2O2", "CO2", "H2O", "O2"], answer: "H2O"},
        { text: "What is produced when an acid reacts with a base?", options: ["Salt and Water", "Gas", "Oxygen", "Hydrogen"], answer: "Salt and Water"}
    ],
    createdBy: 'teacher-uid-1',
    createdAt: new Date(),
    difficulty: 'easy',
    questionType: 'MCQ'
  },
];

export const performanceData = [
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 80 },
    { month: 'Mar', score: 78 },
    { month: 'Apr', score: 85 },
    { month: 'May', score: 88 },
    { month: 'Jun', score: 92 },
];
