
'use server';

/**
 * @fileOverview An AI agent for generating quiz questions from provided text content.
 *
 * - generateQuizFromText - A function that generates quiz questions from text.
 * - GenerateQuizFromTextInput - The input type for the function.
 * - GenerateQuizFromTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
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
  return generateQuizFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromTextPrompt',
  input: {schema: GenerateQuizFromTextInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert quiz question generator for school students.

You will generate quiz questions based on the provided text content.

Difficulty: {{{difficulty}}}
{{#if questionType}}
Question Type: {{{questionType}}}
{{/if}}
{{#if numberOfQuestions}}
Number of Questions: {{{numberOfQuestions}}}
{{/if}}

Please generate the questions from the following text content and provide them in the required structured JSON format. For each question, provide a 'text' field for the question, an 'options' array with 4 multiple-choice options, and an 'answer' field with the correct option. Make sure the questions are directly related to the provided text.

Text Content:
---
{{{textContent}}}
---
`,
});

const generateQuizFromTextFlow = ai.defineFlow(
  {
    name: 'generateQuizFromTextFlow',
    inputSchema: GenerateQuizFromTextInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
