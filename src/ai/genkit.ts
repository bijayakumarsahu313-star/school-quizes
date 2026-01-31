import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This configures Genkit to use the Google AI provider with the necessary API key.
// The API key MUST be set in your environment variables as GOOGLE_API_KEY.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY!,
    }),
  ],
  enableTracingAndMetrics: true,
});
