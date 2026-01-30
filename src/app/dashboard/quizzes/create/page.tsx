
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuizQuestions, AIQuestion } from '@/ai/flows/generate-quiz-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  classLevel: z.coerce.number().min(1).max(12),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionType: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Match the Following', 'Image-based questions']),
  numberOfQuestions: z.coerce.number().min(1, 'Number of questions must be at least 1').max(20),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateQuizPage() {
  const [generatedQuestions, setGeneratedQuestions] = useState<AIQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      classLevel: 8,
      difficulty: 'medium',
      questionType: 'MCQ',
      numberOfQuestions: 5,
      duration: 10,
    },
  });

  async function onGenerateSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedQuestions([]);
    try {
      const result = await generateQuizQuestions(values);
      setGeneratedQuestions(result.questions);
      toast({
        title: "Questions Generated!",
        description: "Your new quiz questions are ready below.",
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

  async function handleSaveQuiz() {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to save a quiz.' });
      return;
    }
    if (generatedQuestions.length === 0) {
      toast({ variant: 'destructive', title: 'Please generate questions before saving.' });
      return;
    }

    setIsSaving(true);
    const formValues = form.getValues();

    try {
      const quizData = {
        ...formValues,
        questions: generatedQuestions,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'Draft',
      };

      const quizzesCollection = collection(firestore, 'quizzes');
      await addDoc(quizzesCollection, quizData);

      toast({
        title: 'Quiz Saved!',
        description: 'Your quiz has been saved as a draft.',
      });
      router.push('/dashboard/quizzes');
    } catch (error) {
      console.error('Error saving quiz: ', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'There was an error saving your quiz. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Quiz with AI</CardTitle>
            <CardDescription>
              Fill in the details below, and our AI will generate a quiz for you in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onGenerateSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Algebra Basics" {...field} />
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
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MCQ">MCQ</SelectItem>
                          <SelectItem value="True/False">True/False</SelectItem>
                          <SelectItem value="Fill in the Blanks">Fill in the Blanks</SelectItem>
                          <SelectItem value="Match the Following">Match the Following</SelectItem>
                          <SelectItem value="Image-based questions">Image-based</SelectItem>
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
              Review the AI-generated questions below. You can edit them before saving the quiz.
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
              <Button onClick={handleSaveQuiz} disabled={isSaving || isLoading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Quiz
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
