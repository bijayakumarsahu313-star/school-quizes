
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, firestore as db } from '@/firebase/provider';
import type { Question } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreateQuizPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSaveQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const school = (form.elements.namedItem('school') as HTMLInputElement).value;
    const className = (form.elements.namedItem('class') as HTMLInputElement).value;
    const questionsContent = (form.elements.namedItem('questions') as HTMLTextAreaElement).value;

    if (!auth.currentUser) {
        toast({ title: "Error", description: "You must be logged in to create a quiz.", variant: "destructive" });
        setLoading(false);
        return;
    }

    try {
        const questions = parseManualQuestions(questionsContent);
        if (questions.length === 0) {
            toast({ title: "Invalid Format", description: "Could not find any valid questions. Please check the format instructions.", variant: "destructive" });
            setLoading(false);
            return;
        }

        const quizData = {
            title,
            questions,
            school,
            class: className,
            createdBy: auth.currentUser.uid,
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "quizzes"), quizData)
        toast({ title: "Success!", description: "Quiz created successfully." });
        router.push('/dashboard/quizzes');

    } catch (error: any) {
        console.error("Error creating quiz:", error);
        toast({ title: "Error creating quiz", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  function parseManualQuestions(content: string): Question[] {
    const questions: Question[] = [];
    const questionBlocks = content.trim().split('---');

    for (const block of questionBlocks) {
        if (block.trim() === '') continue;

        const lines = block.trim().split('\n');
        const questionTextLine = lines.find(line => line.trim().toUpperCase().startsWith('Q:'));
        if (!questionTextLine) continue;

        const question: Partial<Question> = {
            question: questionTextLine.substring(2).trim(),
            options: [],
        };

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.toUpperCase().startsWith('*A:')) {
                const answer = trimmedLine.substring(3).trim();
                question.answer = answer;
                question.options?.push(answer);
            } else if (trimmedLine.toUpperCase().startsWith('A:') || trimmedLine.toUpperCase().startsWith('O:')) {
                 question.options?.push(trimmedLine.substring(2).trim());
            }
        }
        
        if (question.options) {
            question.options = question.options.sort(() => Math.random() - 0.5);
        }

        if (question.question && question.options && question.options.length > 1 && question.answer) {
             questions.push(question as Question);
        }
    }
    return questions;
  }

  return (
    <div className="flex flex-col gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Create a New Quiz</CardTitle>
                <CardDescription>
                Fill in the details below and add your questions manually.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveQuiz}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Quiz Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Algebra Basics" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="school">School</Label>
                            <Input id="school" name="school" placeholder="e.g., Springfield High" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class">Class</Label>
                            <Input id="class" name="class" placeholder="e.g., 10th A" required />
                        </div>
                    </div>
                    <div>
                         <Label htmlFor="questions">Questions</Label>
                         <div className="p-3 mt-2 bg-muted/50 rounded-lg border border-dashed text-xs text-muted-foreground">
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
                            id="questions"
                            name="questions"
                            placeholder="Enter your questions here following the format rules..."
                            className="min-h-[250px] font-mono text-sm mt-2"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Save Quiz
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
