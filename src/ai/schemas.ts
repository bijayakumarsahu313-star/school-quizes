import { z } from 'zod';

export const GenerateQuizInputSchema = z.object({
    topic: z.string().describe('The topic for the quiz. Used if no PDF is provided.'),
    pdfDataUri: z.string().optional().describe(
        "A PDF document as a data URI. If provided, the quiz will be generated based on the content of this document. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
    numQuestions: z.number().min(1).max(20).describe('The number of questions to generate'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the quiz'),
    questionType: z.enum(['Multiple Choice', 'True/False']).describe('The type of questions'),
    gradeLevel: z.string().optional().describe('The grade level for which the quiz is intended (e.g., "10th Grade")'),
    className: z.string().optional().describe('The class for which the quiz is intended (e.g., "10th A")'),
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;
