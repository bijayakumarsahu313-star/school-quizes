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
  console.log("Simulating a more logical AI summary to avoid API key issues.");
  await new Promise(resolve => setTimeout(resolve, 500));

  const percentage = (input.score / input.maxScore) * 100;
  let performanceTier = "a good effort";
  let encouragement = "Keep practicing and you'll master it!";

  if (percentage >= 90) {
    performanceTier = "an excellent performance";
    encouragement = "Fantastic work! Keep up the great momentum.";
  } else if (percentage >= 75) {
    performanceTier = "a strong performance";
    encouragement = "You're doing great! A little more focus will get you to the top.";
  }

  const summary = `${input.studentName} demonstrated ${performanceTier} on the "${input.quizName}" quiz, scoring ${input.score} out of ${input.maxScore}.
A key area for improvement is: ${input.areasForImprovement}.
${encouragement}`;
  
  return { summary };
}
