'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input Schema
export const GeneratePracticeQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z.number().min(1).max(20).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the quiz.'),
});
export type GeneratePracticeQuizInput = z.infer<typeof GeneratePracticeQuizInputSchema>;

// Output Schemas
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


const generatePracticeQuizFlow = ai.defineFlow(
    {
        name: 'generatePracticeQuizFlow',
        inputSchema: GeneratePracticeQuizInputSchema,
        outputSchema: PracticeQuizSchema,
    },
    async (input) => {
        const prompt = `
You are an expert in creating educational practice quizzes for students.
Generate a quiz based on the following criteria. The output MUST be a valid JSON object matching the provided schema.

Topic: ${input.topic}
Number of Questions: ${input.numQuestions}
Difficulty: ${input.difficulty}

- The title should be concise and relevant to the topic.
- The subject should be a single, general category.
- Each question must have a 'question', 'options', 'answer', and a helpful 'explanation'.
- The 'answer' must be one of the strings present in the 'options' array.
`;

        const llmResponse = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: prompt,
            output: {
                format: 'json',
                schema: PracticeQuizSchema
            }
        });
        
        const quizOutput = llmResponse.output();

        if (!quizOutput) {
            throw new Error("AI failed to generate quiz in the expected format.");
        }

        return quizOutput;
    }
);

export async function generatePracticeQuiz(input: GeneratePracticeQuizInput): Promise<PracticeQuiz> {
    return generatePracticeQuizFlow(input);
}
