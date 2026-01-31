'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateQuizInputSchema = z.object({
    topic: z.string().describe('The topic for the quiz'),
    numQuestions: z.number().min(1).max(20).describe('The number of questions to generate'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the quiz'),
    questionType: z.enum(['Multiple Choice', 'True/False']).describe('The type of questions'),
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const prompt = ai.definePrompt(
    {
        name: 'generateQuizPrompt',
        input: { schema: GenerateQuizInputSchema },
        output: {
            format: 'text',
        },
        prompt: `You are an expert quiz creator for school students. Generate a quiz based on the following criteria:

Topic: {{topic}}
Number of Questions: {{numQuestions}}
Difficulty: {{difficulty}}
Question Type: {{questionType}}

VERY IMPORTANT: Your response MUST be only the quiz content and strictly follow this format for each question:
- Start each question with "Q: "
- Mark the correct answer with "*A: "
- Mark other options with "O: "
- Separate each question block with "---" on a new line.

Do not include any other text, titles, or explanations before or after the quiz content.

Example for Multiple Choice:
Q: What is the capital of France?
*A: Paris
O: London
O: Berlin
---
Q: What is 2 + 2?
*A: 4
O: 3
O: 5

Example for True/False:
Q: The sky is blue.
*A: True
O: False
---
Q: Humans can fly without assistance.
*A: False
O: True
`,
    },
);

export const generateQuizFlow = ai.defineFlow(
    {
        name: 'generateQuizFlow',
        inputSchema: GenerateQuizInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        const llmResponse = await prompt(input);
        return llmResponse.text;
    }
);

export async function generateQuiz(input: GenerateQuizInput): Promise<string> {
    return generateQuizFlow(input);
}
