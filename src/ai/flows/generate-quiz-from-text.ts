'use server';

/**
 * @fileOverview An AI agent for generating quiz questions from provided text content.
 *
 * - generateQuizFromText - A function that generates quiz questions from text.
 * - GenerateQuizFromTextInput - The input type for the function.
 * - GenerateQuizFromTextOutput - The return type for the function.
 */
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import { GenerateQuizQuestionsOutput, GenerateQuizQuestionsOutputSchema } from '@/ai/schemas/quiz-schemas';
import { ai } from '@/ai/genkit';

const GenerateQuizFromTextInputSchema = z.object({
  textContent: z.string().describe('The text content to generate the quiz from.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz questions.'),
  questionType: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Match the Following', 'Image-based questions']).optional().describe('The types of questions you want in the quiz'),
  numberOfQuestions: z.number().int().min(1).max(20).optional().describe('The number of questions to generate.'),
});
export type GenerateQuizFromTextInput = z.infer<typeof GenerateQuizFromTextInputSchema>;
export type GenerateQuizFromTextOutput = GenerateQuizQuestionsOutput;


export async function generateQuizFromText(input: GenerateQuizFromTextInput): Promise<GenerateQuizFromTextOutput> {
    const promptText = `You are an expert quiz question generator for school students.

You will generate quiz questions based on the provided text content.

Difficulty: ${input.difficulty}
${input.questionType ? `Question Type: ${input.questionType}` : ''}
${input.numberOfQuestions ? `Number of Questions: ${input.numberOfQuestions}` : ''}

Please generate the questions from the following text content and provide them in a structured JSON format. For each question, provide a 'text' field for the question, an 'options' array with 4 multiple-choice options, and an 'answer' field with the correct option. Make sure the questions are directly related to the provided text.

Your entire response must be ONLY the JSON object, with no other text or formatting.
The JSON object should conform to this structure:
{
  "questions": [
    {
      "text": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    }
  ]
}

Text Content:
---
${input.textContent}
---
`;

    const response = await ai.generate({
        prompt: promptText,
        model: googleAI.model('gemini-pro'),
        config: {
            responseMimeType: "application/json",
        },
    });

    const jsonString = response.text;
    
    try {
        const parsedJson = JSON.parse(jsonString);
        const validatedData = GenerateQuizQuestionsOutputSchema.parse(parsedJson);
        return validatedData;
    } catch (error) {
        console.error("Failed to parse or validate AI response:", error);
        throw new Error("AI returned an invalid response format. Please try generating again.");
    }
}
