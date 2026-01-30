'use server';
/**
 * @fileOverview Summarizes a student's performance on a quiz.
 *
 * - summarizeStudentPerformance - A function that summarizes student performance.
 * - SummarizeStudentPerformanceInput - The input type for the summarizeStudentPerformance function.
 * - SummarizeStudentPerformanceOutput - The return type for the summarizeStudentPerformance function.
 */

import { z } from 'genkit';

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
  console.log("Simulating AI response due to persistent API key issues.");
  await new Promise(resolve => setTimeout(resolve, 500));

  const summary = `This is a simulated performance summary for ${input.studentName}. They scored ${input.score} out of ${input.maxScore}. They need to improve on: ${input.areasForImprovement}. Keep up the great work!`;
  
  return { summary };
}
