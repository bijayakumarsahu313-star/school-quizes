'use server';

/**
 * @fileOverview An AI agent for generating quiz questions from provided text content.
 *
 * - generateQuizFromText - A function that generates quiz questions from text.
 * - GenerateQuizFromTextInput - The input type for the function.
 * - GenerateQuizFromTextOutput - The return type for the function.
 */
import { z } from 'genkit';
import { GenerateQuizQuestionsOutput } from '@/ai/schemas/quiz-schemas';

const GenerateQuizFromTextInputSchema = z.object({
  textContent: z.string().describe('The text content to generate the quiz from.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz questions.'),
  questionType: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Match the Following', 'Image-based questions']).optional().describe('The types of questions you want in the quiz'),
  numberOfQuestions: z.number().int().min(1).max(20).optional().describe('The number of questions to generate.'),
});
export type GenerateQuizFromTextInput = z.infer<typeof GenerateQuizFromTextInputSchema>;
export type GenerateQuizFromTextOutput = GenerateQuizQuestionsOutput;


export async function generateQuizFromText(input: GenerateQuizFromTextInput): Promise<GenerateQuizFromTextOutput> {
    console.log("Simulating AI response due to persistent API key issues.");
    await new Promise(resolve => setTimeout(resolve, 1000));

    const fakeQuestions = Array.from({ length: input.numberOfQuestions || 5 }, (_, i) => ({
      text: `This is a simulated question ${i + 1} from the provided text content.`,
      options: ["Option 1", "Option 2", "Option 3", "Correct Answer"],
      answer: "Correct Answer",
    }));

    return { questions: fakeQuestions };
}
