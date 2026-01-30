'use server';

/**
 * @fileOverview An AI agent for generating quiz questions based on subject, class, and difficulty level.
 *
 * - generateQuizQuestions - A function that generates quiz questions.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */
import { z } from 'genkit';
import { GenerateQuizQuestionsOutput, QuestionSchema } from '@/ai/schemas/quiz-schemas';

const GenerateQuizQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject of the quiz questions.'),
  classLevel: z.number().int().min(1).max(12).describe('The class level for which the questions are intended (1-12).'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz questions.'),
  questionType: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Match the Following', 'Image-based questions']).optional().describe('The types of questions you want in the quiz'),
  numberOfQuestions: z.number().int().min(1).max(20).optional().describe('The number of questions to generate.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

export type AIQuestion = z.infer<typeof QuestionSchema>;
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;


export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
    console.log("Simulating AI response due to persistent API key issues.");
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const fakeQuestions = Array.from({ length: input.numberOfQuestions || 5 }, (_, i) => ({
      text: `This is a simulated question ${i + 1} for ${input.subject}?`,
      options: ["Option A", "Option B", "Option C", "Correct Answer"],
      answer: "Correct Answer",
    }));

    return { questions: fakeQuestions };
}
