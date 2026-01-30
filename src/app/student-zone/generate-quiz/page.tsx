
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuizQuestions, AIQuestion } from '@/ai/flows/generate-quiz-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import type { Quiz, UserProfile } from '@/lib/data';
import { useUser, useDoc } from '@/firebase';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  classLevel: z.coerce.number().min(1).max(12),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numberOfQuestions: z.coerce.number().min(1, 'Number of questions must be at least 1').max(20),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudentGenerateQuizPage() {
  const router = useRouter();
  const [generatedQuestions, setGeneratedQuestions] = useState<AIQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizSettings, setQuizSettings] = useState<FormValues | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const { data: userProfile } = useDoc<UserProfile>(user ? 'users' : null, user?.uid);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: 'My Practice Quiz',
      subject: '',
      classLevel: 8,
      difficulty: 'medium',
      numberOfQuestions: 5,
      duration: 10,
    },
  });

  useEffect(() => {
    if (userProfile?.classLevel) {
        form.setValue('classLevel', userProfile.classLevel);
    }
  }, [userProfile, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedQuestions([]);
    try {
      const result = await generateQuizQuestions({ 
          ...values, 
          questionType: 'MCQ',
          board: userProfile?.board
      });
      setGeneratedQuestions(result.questions);
      setQuizSettings(values);
      toast({
        title: "Questions Generated!",
        description: "Your new practice quiz is ready below.",
      });
    } catch (error) {
      console.error('Failed to generate quiz questions:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating questions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function startQuiz() {
    if (!quizSettings || generatedQuestions.length === 0) return;

    const practiceQuiz: Omit<Quiz, 'createdBy' | 'createdAt'> = {
      id: `practice-${Date.now()}`,
      title: quizSettings.title,
      subject: quizSettings.subject,
      classLevel: quizSettings.classLevel,
      board: userProfile?.board,
      numberOfQuestions: quizSettings.numberOfQuestions,
      duration: quizSettings.duration,
      questions: generatedQuestions,
      difficulty: quizSettings.difficulty,
      questionType: 'MCQ',
      status: 'Published',
    };

    sessionStorage.setItem('practiceQuiz', JSON.stringify(practiceQuiz));
    router.push('/quiz/practice');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Generate a Practice Quiz</CardTitle>
                <CardDescription>
                  Create a custom quiz with AI to practice any topic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Algebra Practice" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Physics, History" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="classLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Level</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numberOfQuestions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Questions</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Generate Questions
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="min-h-full">
              <CardHeader>
                <CardTitle>Generated Questions</CardTitle>
                <CardDescription>
                  Review the questions below. When you're ready, start the quiz!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating your quiz...</p>
                  </div>
                )}
                {!isLoading && generatedQuestions.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Your generated questions will appear here.</p>
                  </div>
                )}
                {generatedQuestions.length > 0 && (
                  <div className="space-y-4">
                    {generatedQuestions.map((q, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/50">
                         <p><strong>Q{index + 1}:</strong> {q.text}</p>
                         <div className="pl-4 mt-2 space-y-1 text-sm text-muted-foreground">
                            {q.options.map((opt, i) => (
                                <p key={i} className={opt === q.answer ? 'text-green-600 font-bold' : ''}>- {opt}</p>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {generatedQuestions.length > 0 && (
                <CardFooter>
                  <Button onClick={startQuiz}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Practice Quiz
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
