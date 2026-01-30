'use server';

/**
 * @fileOverview An AI agent for generating quiz questions based on subject, class, and difficulty level.
 *
 * - generateQuizQuestions - A function that generates quiz questions.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';
import { GenerateQuizQuestionsOutput, GenerateQuizQuestionsOutputSchema, QuestionSchema } from '@/ai/schemas/quiz-schemas';

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
    const ai = genkit({
      plugins: [
        googleAI({ apiKey: process.env.GEMINI_API_KEY }),
      ],
    });
    
    const promptText = `You are an expert quiz question generator for school students.

You will generate quiz questions for the following subject, class level, and difficulty level.

Subject: ${input.subject}
Class Level: ${input.classLevel}
Difficulty: ${input.difficulty}
${input.questionType ? `Question Type: ${input.questionType}` : ''}
${input.numberOfQuestions ? `Number of Questions: ${input.numberOfQuestions}` : ''}

Please generate the questions and provide them in a structured JSON format. For each question, provide a 'text' field for the question, an 'options' array with 4 multiple-choice options, and an 'answer' field with the correct option.

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
