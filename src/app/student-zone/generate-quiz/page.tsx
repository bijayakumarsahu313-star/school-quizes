'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePracticeQuiz } from '@/ai/flows/generate-practice-quiz-flow';
import type { PracticeQuiz } from '@/ai/schemas';

export default function GeneratePracticeQuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const topic = formData.get('topic') as string;
    const numQuestions = parseInt(formData.get('numQuestions') as string, 10);
    const difficulty = formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard';
    const duration = parseInt(formData.get('duration') as string, 10);

    if (!topic) {
      toast({
        title: 'Topic is required',
        description: 'Please enter a topic for your practice quiz.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const quizData = await generatePracticeQuiz({
        topic,
        numQuestions,
        difficulty,
      });

      // Add duration from the form to the quiz object
      const quizWithDuration: PracticeQuiz & { duration: number } = {
        ...quizData,
        duration,
      };

      sessionStorage.setItem('practiceQuiz', JSON.stringify(quizWithDuration));
      toast({
        title: 'Quiz Generated!',
        description: 'Your practice quiz is ready. Good luck!',
      });
      router.push('/quiz/practice');
    } catch (error) {
      console.error('Failed to generate practice quiz:', error);
      toast({
        title: 'Generation Failed',
        description: 'The AI could not generate a quiz for this topic. Please try another one.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900/10 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                  <BrainCircuit className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Generate a Practice Quiz</CardTitle>
              <CardDescription>
                Challenge yourself with a custom quiz on any topic, generated just for you by our AI.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" name="topic" placeholder="e.g., The Roman Empire, Photosynthesis, Python loops" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numQuestions">Number of Questions</Label>
                    <Select name="numQuestions" defaultValue="5">
                      <SelectTrigger id="numQuestions">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select name="difficulty" defaultValue="Medium">
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select name="duration" defaultValue="10">
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate & Start Quiz'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
