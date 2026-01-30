
'use server';

/**
 * @fileOverview An AI agent for generating quiz questions from provided text content.
 *
 * - generateQuizFromText - A function that generates quiz questions from text.
 * - GenerateQuizFromTextInput - The input type for the function.
 * - GenerateQuizFromTextOutput - The return type for the function.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { GenerateQuizQuestionsOutput, GenerateQuizQuestionsOutputSchema } from '@/ai/schemas/quiz-schemas';

const GenerateQuizFromTextInputSchema = z.object({
  textContent: z.string().describe('The text content to generate the quiz from.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz questions.'),
  questionType: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Match the Following', 'Image-based questions']).optional().describe('The types of questions you want in the quiz'),
  numberOfQuestions: z.number().int().min(1).max(20).optional().describe('The number of questions to generate.'),
});
export type GenerateQuizFromTextInput = z.infer<typeof GenerateQuizFromTextInputSchema>;
export type GenerateQuizFromTextOutput = GenerateQuizQuestionsOutput;


export async function generateQuizFromText(input: GenerateQuizFromTextInput): Promise<GenerateQuizFromTextOutput> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the server environment.");
    }
    const ai = genkit({
        plugins: [googleAI({apiKey})],
    });

    const promptText = `You are an expert quiz question generator for school students.

You will generate quiz questions based on the provided text content.

Difficulty: ${input.difficulty}
${input.questionType ? `Question Type: ${input.questionType}` : ''}
${input.numberOfQuestions ? `Number of Questions: ${input.numberOfQuestions}` : ''}

Please generate the questions from the following text content and provide them in the required structured JSON format. For each question, provide a 'text' field for the question, an 'options' array with 4 multiple-choice options, and an 'answer' field with the correct option. Make sure the questions are directly related to the provided text.

Text Content:
---
${input.textContent}
---
`;

    const response = await ai.generate({
        prompt: promptText,
        output: {
            schema: GenerateQuizQuestionsOutputSchema,
        },
        model: googleAI.model('gemini-pro'),
    });

    const output = response.output;

    if (!output) {
        throw new Error("AI failed to generate quiz questions from text.");
    }

    return output;
}
