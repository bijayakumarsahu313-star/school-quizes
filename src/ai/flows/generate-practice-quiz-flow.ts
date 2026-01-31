'use server';

import { ai } from '@/ai/genkit';
import { GeneratePracticeQuizInputSchema, PracticeQuizSchema, type GeneratePracticeQuizInput, type PracticeQuiz } from '@/ai/schemas';

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
