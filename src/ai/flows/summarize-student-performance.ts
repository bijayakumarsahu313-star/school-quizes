'use server';
/**
 * @fileOverview Summarizes a student's performance on a quiz.
 *
 * - summarizeStudentPerformance - A function that summarizes student performance.
 * - SummarizeStudentPerformanceInput - The input type for the summarizeStudentPerformance function.
 * - SummarizeStudentPerformanceOutput - The return type for the summarizeStudentPerformance function.
 */

import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const SummarizeStudentPerformanceInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  quizName: z.string().describe('The name of the quiz.'),
  score: z.number().describe('The student’s score on the quiz.'),
  maxScore: z.number().describe('The maximum possible score on the quiz.'),
  areasForImprovement: z
    .string()
    .describe('Specific areas where the student needs improvement.'),
});
export type SummarizeStudentPerformanceInput = z.infer<
  typeof SummarizeStudentPerformanceInputSchema
>;

const SummarizeStudentPerformanceOutputSchema = z.object({
  summary: z.string().describe('A summary of the student\'s performance.'),
});
export type SummarizeStudentPerformanceOutput = z.infer<
  typeof SummarizeStudentPerformanceOutputSchema
>;

export async function summarizeStudentPerformance(
  input: SummarizeStudentPerformanceInput
): Promise<SummarizeStudentPerformanceOutput> {
  const promptText = `Summarize the performance of ${input.studentName} on the ${input.quizName} quiz.

  ${input.studentName} scored ${input.score} out of a possible ${input.maxScore} points.

  Areas for improvement: ${input.areasForImprovement}`;

  const response = await ai.generate({
    prompt: promptText,
    output: {
        schema: SummarizeStudentPerformanceOutputSchema,
    },
    model: googleAI.model('gemini-pro'),
  });

  const output = response.output;

  if (!output) {
      throw new Error("AI failed to summarize student performance.");
  }
  
  return output;
}
