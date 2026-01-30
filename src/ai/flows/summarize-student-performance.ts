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

  Areas for improvement: ${input.areasForImprovement}

  Please provide the summary in a structured JSON format. Your entire response must be ONLY the JSON object, with no other text or formatting.
  The JSON object should conform to this structure:
  {
    "summary": "string"
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
      const validatedData = SummarizeStudentPerformanceOutputSchema.parse(parsedJson);
      return validatedData;
  } catch (error) {
      console.error("Failed to parse or validate AI response:", error);
      throw new Error("AI returned an invalid response format. Please try generating again.");
  }
}
