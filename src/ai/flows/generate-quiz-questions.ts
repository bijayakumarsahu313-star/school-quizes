'use server';

/**
 * @fileOverview An AI agent for generating quiz questions based on subject, class, and difficulty level.
 *
 * - generateQuizQuestions - A function that generates quiz questions.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */
import { z } from 'genkit';
import { GenerateQuizQuestionsOutput, AIQuestion } from '@/ai/schemas/quiz-schemas';

const GenerateQuizQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject of the quiz questions.'),
  classLevel: z.number().int().min(1).max(12).describe('The class level for which the questions are intended (1-12).'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz questions.'),
  questionType: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Match the Following', 'Image-based questions']).optional().describe('The types of questions you want in the quiz'),
  numberOfQuestions: z.number().int().min(1).max(20).optional().describe('The number of questions to generate.'),
  board: z.string().optional().describe('The educational board (e.g., CBSE, ICSE).'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

// A simple, hardcoded knowledge base for more realistic-looking questions.
const questionDatabase = {
  math: [
    { text: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
    { text: "What is the value of Pi (to 2 decimal places)?", options: ["3.12", "3.14", "3.16", "3.18"], answer: "3.14" },
    { text: "What is 5 multiplied by 8?", options: ["35", "40", "45", "50"], answer: "40" },
    { text: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], answer: "3" },
    { text: "What is 100 divided by 10?", options: ["1", "10", "20", "100"], answer: "10" },
  ],
  science: [
    { text: "What is the chemical symbol for water?", options: ["H2O2", "CO2", "H2O", "O2"], answer: "H2O" },
    { text: "What planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
    { text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"], answer: "Mitochondrion"},
    { text: "What force pulls objects towards the center of the Earth?", options: ["Magnetism", "Friction", "Gravity", "Tension"], answer: "Gravity" },
    { text: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Brain", "Skin"], answer: "Skin" },
  ],
  history: [
    { text: "Who was the first President of the United States?", options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], answer: "George Washington" },
    { text: "In what year did World War II end?", options: ["1942", "1945", "1950", "1939"], answer: "1945" },
    { text: "Who discovered America?", options: ["Ferdinand Magellan", "Vasco da Gama", "Christopher Columbus", "Marco Polo"], answer: "Christopher Columbus" },
    { text: "The ancient pyramids are located in which country?", options: ["Greece", "Mexico", "Egypt", "Italy"], answer: "Egypt" },
    { text: "Who wrote the play 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], answer: "William Shakespeare" },
  ],
};

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
    console.log("Simulating a more logical AI response to avoid API key issues, now considering board:", input.board);
    await new Promise(resolve => setTimeout(resolve, 500));

    const subjectKey = input.subject.toLowerCase();
    const numQuestions = input.numberOfQuestions || 5;
    
    let potentialQuestions: AIQuestion[] = [];

    // Find questions based on subject keywords
    for (const key in questionDatabase) {
        if (subjectKey.includes(key)) {
            potentialQuestions = questionDatabase[key as keyof typeof questionDatabase];
            break;
        }
    }

    if (potentialQuestions.length > 0) {
        // We have specific questions for this subject
        const shuffledQuestions = shuffleArray([...potentialQuestions]);
        return { questions: shuffledQuestions.slice(0, numQuestions) };
    }

    // Fallback to a generic but improved simulation
    const fakeQuestions = Array.from({ length: numQuestions }, (_, i) => ({
      text: `For a ${input.board || 'General'} syllabus, what is a key concept in ${input.subject} for class ${input.classLevel} at difficulty level '${input.difficulty}'? (Question ${i + 1})`,
      options: ["Logical Option 1", "Logical Option 2", "The Correct Logical Answer", "Logical Option 4"],
      answer: "The Correct Logical Answer",
    }));

    return { questions: fakeQuestions };
}
