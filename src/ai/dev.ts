import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/summarize-student-performance.ts';
import '@/ai/flows/generate-quiz-from-text.ts';
