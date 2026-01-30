
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuizQuestions, AIQuestion } from '@/ai/flows/generate-quiz-questions';
import { generateQuizFromText } from '@/ai/flows/generate-quiz-from-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  classLevel: z.coerce.number().min(1).max(12),
  board: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionType: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Match the Following', 'Image-based questions']),
  numberOfQuestions: z.coerce.number().min(1, 'Number of questions must be at least 1').max(20),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
});

type FormValues = z.infer<typeof formSchema>;

const contentFormSchema = formSchema.extend({
  textContent: z.string().min(50, 'Please provide at least 50 characters of content.'),
});
type ContentFormValues = z.infer<typeof contentFormSchema>;

const manualFormSchema = z.object({
  manualContent: z.string().min(1, 'Please enter at least one question.'),
});


export default function CreateQuizPage() {
  const [activeTab, setActiveTab] = useState('topic');
  const [generatedQuestions, setGeneratedQuestions] = useState<AIQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [quizDetails, setQuizDetails] = useState<Omit<FormValues, 'textContent'>>({
    title: '',
    subject: '',
    classLevel: 8,
    board: '',
    difficulty: 'medium',
    questionType: 'MCQ',
    numberOfQuestions: 5,
    duration: 10,
  });
  const [manualContent, setManualContent] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      classLevel: 8,
      board: '',
      difficulty: 'medium',
      questionType: 'MCQ',
      numberOfQuestions: 5,
      duration: 10,
    },
  });

  const contentForm = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: '',
      subject: '',
      classLevel: 8,
      board: '',
      difficulty: 'medium',
      questionType: 'MCQ',
      numberOfQuestions: 5,
      duration: 10,
      textContent: '',
    },
  });

  async function onGenerateSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedQuestions([]);
    setQuizDetails(values);
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

  async function onContentGenerateSubmit(values: ContentFormValues) {
    setIsLoading(true);
    setGeneratedQuestions([]);
    const { textContent, ...details } = values;
    setQuizDetails(details);
    try {
      const result = await generateQuizFromText({
        textContent: values.textContent,
        difficulty: values.difficulty,
        questionType: values.questionType,
        numberOfQuestions: values.numberOfQuestions,
        board: values.board,
      });
      setGeneratedQuestions(result.questions);
      toast({
        title: "Questions Generated!",
        description: "Your new quiz questions from your content are ready below.",
      });
    } catch (error) {
      console.error('Failed to generate quiz questions from content:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating questions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function parseManualQuestions(content: string): AIQuestion[] {
    const questions: AIQuestion[] = [];
    const questionBlocks = content.trim().split('---');

    for (const block of questionBlocks) {
        if (block.trim() === '') continue;

        const lines = block.trim().split('\n');
        const questionTextLine = lines.find(line => line.trim().toUpperCase().startsWith('Q:'));
        if (!questionTextLine) continue;

        const question: AIQuestion = {
            text: questionTextLine.substring(2).trim(),
            options: [],
            answer: '',
        };

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.toUpperCase().startsWith('*A:')) {
                const answer = trimmedLine.substring(3).trim();
                question.answer = answer;
                question.options.push(answer);
            } else if (trimmedLine.toUpperCase().startsWith('A:') || trimmedLine.toUpperCase().startsWith('O:')) {
                 question.options.push(trimmedLine.substring(2).trim());
            }
        }
        
        if (question.text && question.options.length > 1 && question.answer) {
             questions.push(question);
        }
    }
    return questions;
  }

  async function handleSaveQuiz() {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to save a quiz.' });
      return;
    }
    
    let questionsToSave: AIQuestion[] = [];
    let detailsToSave = quizDetails;

    if (activeTab === 'manual') {
        const formValues = form.getValues();
        detailsToSave = { ...formValues, numberOfQuestions: 0, questionType: 'MCQ' };
        questionsToSave = parseManualQuestions(manualContent);
        if(questionsToSave.length === 0) {
            toast({ variant: 'destructive', title: 'Invalid Format', description: 'Could not find any valid questions in the manual entry. Please check the format.' });
            return;
        }
    } else {
        questionsToSave = generatedQuestions;
        if (activeTab === 'topic') detailsToSave = form.getValues();
        if (activeTab === 'content') detailsToSave = contentForm.getValues();
    }
    
    if (questionsToSave.length === 0) {
      toast({ variant: 'destructive', title: 'Please generate or enter questions before saving.' });
      return;
    }
    if (!detailsToSave || !detailsToSave.title) {
      toast({ variant: 'destructive', title: 'Please ensure quiz details are filled out before saving.' });
      return;
    }

    setIsSaving(true);

    const quizData = {
      ...detailsToSave,
      questions: questionsToSave,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      status: 'Draft',
    };

    const quizzesCollection = collection(firestore, 'quizzes');
    addDoc(quizzesCollection, quizData)
      .then(() => {
        toast({
          title: 'Quiz Saved!',
          description: 'Your quiz has been saved as a draft.',
        });
        router.push('/dashboard/quizzes');
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: quizzesCollection.path,
          operation: 'create',
          requestResourceData: quizData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Tabs defaultValue="topic" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topic">From Topic</TabsTrigger>
            <TabsTrigger value="content">From Content</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          <TabsContent value="topic">
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
                    <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Quiz Title</FormLabel> <FormControl> <Input placeholder="e.g., Algebra Basics" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="subject" render={({ field }) => ( <FormItem> <FormLabel>Subject</FormLabel> <FormControl> <Input placeholder="e.g., Physics, History" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="classLevel" render={({ field }) => ( <FormItem> <FormLabel>Class Level</FormLabel> <FormControl> <Input type="number" min="1" max="12" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField control={form.control} name="board" render={({ field }) => ( <FormItem> <FormLabel>Board (Optional)</FormLabel> <FormControl> <Input placeholder="e.g., CBSE" {...field} value={field.value ?? ''}/> </FormControl> <FormMessage /> </FormItem> )}/>
                    </div>
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
                    <FormField control={form.control} name="numberOfQuestions" render={({ field }) => ( <FormItem> <FormLabel>Number of Questions</FormLabel> <FormControl> <Input type="number" min="1" max="20" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="duration" render={({ field }) => ( <FormItem> <FormLabel>Duration (minutes)</FormLabel> <FormControl> <Input type="number" min="1" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Wand2 className="mr-2 h-4 w-4" /> )}
                      Generate Questions
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Create From Your Content</CardTitle>
                <CardDescription>
                  Paste your text or upload a file to generate a quiz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...contentForm}>
                  <form onSubmit={contentForm.handleSubmit(onContentGenerateSubmit)} className="space-y-6">
                    <FormField control={contentForm.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Quiz Title</FormLabel> <FormControl> <Input placeholder="e.g., Chapter 5 Review" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={contentForm.control} name="subject" render={({ field }) => ( <FormItem> <FormLabel>Subject</FormLabel> <FormControl> <Input placeholder="e.g., Biology" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={contentForm.control} name="textContent" render={({ field }) => ( <FormItem> <FormLabel>Your Content</FormLabel> <FormControl> <Textarea placeholder="Paste your lesson notes, an article, or any text here..." className="min-h-[150px]" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormItem>
                      <FormLabel>Or Upload a File (PDF/DOCX)</FormLabel>
                      <FormControl>
                        <Input type="file" disabled title="PDF and DOCX upload coming soon!"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={contentForm.control} name="classLevel" render={({ field }) => ( <FormItem> <FormLabel>Class</FormLabel> <FormControl> <Input type="number" min="1" max="12" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField control={contentForm.control} name="board" render={({ field }) => ( <FormItem> <FormLabel>Board</FormLabel> <FormControl> <Input placeholder="e.g., CBSE" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={contentForm.control} name="duration" render={({ field }) => ( <FormItem> <FormLabel>Duration (min)</FormLabel> <FormControl> <Input type="number" min="1" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField
                        control={contentForm.control}
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
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <FormField control={contentForm.control} name="numberOfQuestions" render={({ field }) => ( <FormItem> <FormLabel>Questions</FormLabel> <FormControl> <Input type="number" min="1" max="20" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                       <FormField
                          control={contentForm.control}
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
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Wand2 className="mr-2 h-4 w-4" /> )}
                      Generate From Content
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Manual Question Entry</CardTitle>
                <CardDescription>
                    Enter quiz details in the "From Topic" tab, then type your questions below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-3 bg-muted/50 rounded-lg border border-dashed text-xs text-muted-foreground">
                    <p className="font-bold mb-1">Formatting Instructions:</p>
                    <p>• Start each question with `Q:`</p>
                    <p>• Mark the correct answer with `*A:`</p>
                    <p>• Mark other options with `O:`</p>
                    <p>• Separate each question block with `---`</p>
                    <p className="mt-2 font-bold">Example:</p>
                    <pre className="mt-1">
Q: What is 2+2?{'\n'}*A: 4{'\n'}O: 3{'\n'}O: 5{'\n'}---{'\n'}Q: Capital of France?{'\n'}*A: Paris{'\n'}O: London
                    </pre>
                </div>
                 <Textarea
                    placeholder="Enter your questions here following the format rules..."
                    className="min-h-[250px] font-mono text-sm"
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                  />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-full">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Generated Questions</CardTitle>
                    <CardDescription>
                    Review the questions below. You can edit them before saving the quiz.
                    </CardDescription>
                </div>
                 {activeTab !== 'manual' && generatedQuestions.length > 0 && (
                    <Button onClick={handleSaveQuiz} disabled={isSaving || isLoading}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save AI Quiz
                    </Button>
                 )}
                 {activeTab === 'manual' && (
                    <Button onClick={handleSaveQuiz} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Manual Quiz
                    </Button>
                 )}
            </div>
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
                <p className="text-muted-foreground">Generated or manually parsed questions will appear here.</p>
                <p className="text-sm text-muted-foreground mt-1">Fill out a form on the left to begin.</p>
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
        </Card>
      </div>
    </div>
  );
}

    