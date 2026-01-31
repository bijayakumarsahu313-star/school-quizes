import { z } from 'zod';

export const GenerateQuizInputSchema = z.object({
    topic: z.string().describe('The topic for the quiz. Used if no PDF is provided.'),
    pdfDataUri: z.string().optional().describe(
        "A PDF document as a data URI. If provided, the quiz will be generated based on the content of this document. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
    numQuestions: z.number().min(1).max(20).describe('The number of questions to generate'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the quiz'),
    questionType: z.enum(['Multiple Choice', 'True/False']).describe('The type of questions'),
    subject: z.string().optional().describe('The subject for which the quiz is intended (e.g., "History")'),
    className: z.string().optional().describe('The class for which the quiz is intended (e.g., "10th A")'),
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

// Schemas for Practice Quiz
export const GeneratePracticeQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z.number().min(1).max(20).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the quiz.'),
});
export type GeneratePracticeQuizInput = z.infer<typeof GeneratePracticeQuizInputSchema>;

const PracticeQuizQuestionSchema = z.object({
    question: z.string().describe("The text of the quiz question."),
    options: z.array(z.string()).min(2).describe("An array of possible answers."),
    answer: z.string().describe("The correct answer from the options."),
    explanation: z.string().describe("A brief AI-generated explanation for why the answer is correct."),
});

export const PracticeQuizSchema = z.object({
    title: z.string().describe("A suitable title for the quiz based on the topic."),
    subject: z.string().describe("The general subject category of the quiz (e.g., 'History', 'Science', 'Mathematics')."),
    questions: z.array(PracticeQuizQuestionSchema),
});
export type PracticeQuiz = z.infer<typeof PracticeQuizSchema>;
