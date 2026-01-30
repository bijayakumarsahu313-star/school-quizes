export type Student = {
  id: string;
  name: string;
  class: string;
  avatar: string;
  averageScore: number;
  quizzesCompleted: number;
};

export type Quiz = {
  id: string;
  title: string;
  subject: string;
  class: string;
  numberOfQuestions: number;
  averageScore: number;
  status: 'Draft' | 'Published';
};

export const students: Student[] = [
  { id: '1', name: 'Aarav Sharma', class: '10A', avatar: 'https://picsum.photos/seed/s1/40/40', averageScore: 85, quizzesCompleted: 12 },
  { id: '2', name: 'Priya Patel', class: '10A', avatar: 'https://picsum.photos/seed/s2/40/40', averageScore: 92, quizzesCompleted: 15 },
  { id: '3', name: 'Rohan Gupta', class: '9B', avatar: 'https://picsum.photos/seed/s3/40/40', averageScore: 78, quizzesCompleted: 10 },
  { id: '4', name: 'Sneha Reddy', class: '11C', avatar: 'https://picsum.photos/seed/s4/40/40', averageScore: 88, quizzesCompleted: 14 },
  { id: '5', name: 'Vikram Singh', class: '12A', avatar: 'https://picsum.photos/seed/s5/40/40', averageScore: 95, quizzesCompleted: 18 },
];

export const quizzes: Quiz[] = [
  { id: '1', title: 'Algebra Basics', subject: 'Math', class: '8', numberOfQuestions: 15, averageScore: 82, status: 'Published' },
  { id: '2', title: 'Indian Independence Movement', subject: 'Social Studies', class: '10', numberOfQuestions: 20, averageScore: 88, status: 'Published' },
  { id: '3', title: 'Cell Biology', subject: 'Science', class: '9', numberOfQuestions: 25, averageScore: 76, status: 'Published' },
  { id: '4', title: 'Shakespeare\'s Sonnets', subject: 'English', class: '11', numberOfQuestions: 10, averageScore: 91, status: 'Draft' },
  { id: '5', title: 'Chemical Reactions', subject: 'Science', class: '10', numberOfQuestions: 15, averageScore: 85, status: 'Published' },
];

export const performanceData = [
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 80 },
    { month: 'Mar', score: 78 },
    { month: 'Apr', score: 85 },
    { month: 'May', score: 88 },
    { month: 'Jun', score: 92 },
];
