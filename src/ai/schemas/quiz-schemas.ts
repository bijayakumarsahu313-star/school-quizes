
import {z} from 'genkit';

export const QuestionSchema = z.object({
  text: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of 4 possible answers for the question.'),
  answer: z.string().describe('The correct answer from the options array.'),
});

export const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated quiz questions.'),
});

export type AIQuestion = z.infer<typeof QuestionSchema>;
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;
