'use server';

import { ai } from '@/ai/genkit';
import { GenerateQuizInputSchema, QuizQuestionsSchema, type GenerateQuizInput, type QuizQuestion } from '@/ai/schemas';

const generateQuizFlow = ai.defineFlow(
    {
        name: 'generateQuizFlow',
        inputSchema: GenerateQuizInputSchema,
        outputSchema: QuizQuestionsSchema,
    },
    async (input) => {
        
        let promptText = `You are an expert quiz creator for school students. Generate a quiz based on the following criteria. The output MUST be a valid JSON array of question objects, matching the provided schema.

${input.pdfDataUri
    ? `The primary source for the quiz questions is the content of the attached PDF document. The topic below is for context only.\nTopic: ${input.topic}`
    : `Topic: ${input.topic}`
}
Number of Questions: ${input.numQuestions}
Difficulty: ${input.difficulty}
Question Type: ${input.questionType}
`;
        if (input.subject) {
          promptText += `Subject: ${input.subject}\n`;
        }
        if (input.className) {
          promptText += `Class: ${input.className}\n`;
        }

        const promptRequest: any[] = [{ text: promptText }];
        if (input.pdfDataUri) {
            promptRequest.unshift({ media: { url: input.pdfDataUri, contentType: 'application/pdf' } });
        }
        
        const llmResponse = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: promptRequest,
            output: {
                format: 'json',
                schema: QuizQuestionsSchema,
            },
        });

        const quizOutput = llmResponse.output();

        if (!quizOutput) {
            throw new Error("AI failed to generate quiz questions in the expected format.");
        }

        return quizOutput;
    }
);

export async function generateQuiz(input: GenerateQuizInput): Promise<QuizQuestion[]> {
    return generateQuizFlow(input);
}
