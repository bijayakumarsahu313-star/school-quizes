import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "The GEMINI_API_KEY environment variable is not set. Please ensure it is configured in your hosting environment."
  );
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKey }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
