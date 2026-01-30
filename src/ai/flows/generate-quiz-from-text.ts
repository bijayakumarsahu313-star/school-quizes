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
  board: z.string().optional().describe('The educational board (e.g., CBSE, ICSE).'),
});
export type GenerateQuizFromTextInput = z.infer<typeof GenerateQuizFromTextInputSchema>;
export type GenerateQuizFromTextOutput = GenerateQuizQuestionsOutput;


export async function generateQuizFromText(input: GenerateQuizFromTextInput): Promise<GenerateQuizFromTextOutput> {
    console.log("Simulating a more logical AI response from text to avoid API key issues, now considering board:", input.board);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const numQuestions = input.numberOfQuestions || 5;
    // A very basic way to get "keywords" - split text and get some longer words.
    const words = input.textContent.split(/\s+/).filter(w => w.length > 5);
    const keywords = [...new Set(words)].slice(0, numQuestions); // Get unique words

    const fakeQuestions = Array.from({ length: numQuestions }, (_, i) => {
        const keyword = keywords[i] || `concept ${i + 1}`;
        return {
          text: `Based on the provided text for the ${input.board || 'General'} syllabus, what is the significance of "${keyword}"?`,
          options: ["Plausible Answer A", "Plausible Answer B", "Correct Answer based on text", "Plausible Answer D"],
          answer: "Correct Answer based on text",
        };
    });

    return { questions: fakeQuestions };
}
