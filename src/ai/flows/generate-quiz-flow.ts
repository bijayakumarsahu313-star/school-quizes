'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateQuizInputSchema, type GenerateQuizInput } from '@/ai/schemas';

const generateQuizFlow = ai.defineFlow(
    {
        name: 'generateQuizFlow',
        inputSchema: GenerateQuizInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        // Dynamically construct the prompt based on user input.
        let promptText = `You are an expert quiz creator for school students. Generate a quiz based on the following criteria:

${input.pdfDataUri
    ? `The primary source for the quiz questions is the content of the attached PDF document. The topic below is for context only.\nTopic: ${input.topic}`
    : `Topic: ${input.topic}`
}
Number of Questions: ${input.numQuestions}
Difficulty: ${input.difficulty}
Question Type: ${input.questionType}
`;
        if (input.gradeLevel) {
          promptText += `Grade Level: ${input.gradeLevel}\n`;
        }

        promptText += `
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
`;

        const promptRequest: any[] = [{ text: promptText }];
        if (input.pdfDataUri) {
            // Add the PDF media part to the beginning of the prompt array
            promptRequest.unshift({ media: { url: input.pdfDataUri, contentType: 'application/pdf' } });
        }
        
        const llmResponse = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: promptRequest,
        });

        return llmResponse.text;
    }
);

export async function generateQuiz(input: GenerateQuizInput): Promise<string> {
    return generateQuizFlow(input);
}