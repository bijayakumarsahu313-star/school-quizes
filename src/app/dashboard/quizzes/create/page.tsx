'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/firebase/client';
import type { Question } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';
import type { GenerateQuizInput } from '@/ai/schemas';

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

export default function CreateQuizPage() {
    const [saveLoading, setSaveLoading] = useState(false);
    const [generateLoading, setGenerateLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const manualQuestionsRef = useRef<HTMLTextAreaElement>(null);
    const [school, setSchool] = useState('');

    useEffect(() => {
        const adminDetailsString = sessionStorage.getItem('adminDetails');
        if (adminDetailsString) {
            try {
                const admin = JSON.parse(adminDetailsString);
                if (admin.school) {
                    setSchool(admin.school);
                }
            } catch(e) {
                console.error("Failed to parse admin details", e);
            }
        }
    }, []);

    const handleGenerateQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGenerateLoading(true);
    
        const formData = new FormData(e.currentTarget);
        const pdfFile = formData.get('pdf') as File | null;
    
        let pdfDataUri: string | undefined = undefined;
    
        if (pdfFile && pdfFile.size > 0) {
            try {
                pdfDataUri = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            resolve(event.target.result as string);
                        } else {
                            reject(new Error("Failed to read PDF file."));
                        }
                    };
                    reader.onerror = (error) => {
                        reject(error);
                    };
                    reader.readAsDataURL(pdfFile);
                });
            } catch (error) {
                console.error("Error reading PDF file:", error);
                toast({ title: "PDF Read Error", description: "Could not read the provided PDF file. Please try again.", variant: "destructive" });
                setGenerateLoading(false);
                return;
            }
        }

        const topic = formData.get('topic') as string;

        if (!topic && !pdfDataUri) {
            toast({ title: "Input Required", description: "Please provide a topic or upload a PDF to generate a quiz.", variant: "destructive" });
            setGenerateLoading(false);
            return;
        }

        const input: GenerateQuizInput = {
            topic: topic,
            numQuestions: parseInt(formData.get('numQuestions') as string, 10),
            difficulty: formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard',
            questionType: formData.get('questionType') as 'Multiple Choice' | 'True/False',
            gradeLevel: formData.get('gradeLevel') as string | undefined,
            className: formData.get('className') as string | undefined,
            pdfDataUri: pdfDataUri,
        };
    
        try {
            const generatedContent = await generateQuiz(input);
            if (manualQuestionsRef.current) {
                manualQuestionsRef.current.value = generatedContent;
            }
            toast({ title: "Quiz Generated!", description: "Review the questions below and save the quiz." });
        } catch (error) {
            console.error("Error generating quiz:", error);
            toast({ title: "Generation Failed", description: "The AI failed to generate a quiz. Please try again.", variant: "destructive" });
        } finally {
            setGenerateLoading(false);
        }
    };

    const handleSaveQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaveLoading(true);

        const form = e.currentTarget;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const className = (form.elements.namedItem('class') as HTMLInputElement).value;
        const questionsContent = (form.elements.namedItem('questions') as HTMLTextAreaElement).value;

        if (!school) {
            toast({ title: "Error", description: "School information not found. Please log in again.", variant: "destructive" });
            setSaveLoading(false);
            return;
        }

        try {
            const questions = parseManualQuestions(questionsContent);
            if (questions.length === 0) {
                toast({ title: "Invalid Format", description: "Could not find any valid questions. Please check the format instructions.", variant: "destructive" });
                setSaveLoading(false);
                return;
            }

            const quizData = {
                title,
                questions,
                school,
                class: className,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "quizzes"), quizData)
            toast({ title: "Success!", description: "Quiz created successfully." });
            router.push('/dashboard/quizzes');

        } catch (error: any) {
            console.error("Error creating quiz:", error);
            toast({ title: "Error creating quiz", description: "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary" /> Generate Quiz with AI
                    </CardTitle>
                    <CardDescription>
                        Let AI do the heavy lifting. Provide a topic, upload a PDF, or both!
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleGenerateQuiz}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic</Label>
                            <Input id="topic" name="topic" placeholder="e.g., The Solar System (optional if PDF is used)" />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pdf">Upload PDF</Label>
                            <Input id="pdf" name="pdf" type="file" accept="application/pdf" className="file:text-primary file:font-semibold" />
                            <p className="text-xs text-muted-foreground">Generate questions directly from a PDF document.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
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
                                <Label htmlFor="questionType">Question Type</Label>
                                <Select name="questionType" defaultValue="Multiple Choice">
                                    <SelectTrigger id="questionType">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                        <SelectItem value="True/False">True/False</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gradeLevel">Grade Level</Label>
                                <Input id="gradeLevel" name="gradeLevel" placeholder="e.g., 10th Grade" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="className">Class</Label>
                                <Input id="className" name="className" placeholder="e.g., 10th A" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={generateLoading}>
                            {generateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Questions
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Review & Save Quiz</CardTitle>
                    <CardDescription>
                        Review the generated questions or enter them manually, then save the quiz.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveQuiz}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Quiz Title</Label>
                            <Input id="title" name="title" placeholder="e.g., The Solar System" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="school">School</Label>
                                <Input id="school" name="school" value={school} placeholder="Your school will appear here..." required disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class">Class</Label>
                                <Input id="class" name="class" placeholder="e.g., 10th A" required />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="questions">Questions & Answers</Label>
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
                                ref={manualQuestionsRef}
                                id="questions"
                                name="questions"
                                placeholder="Enter your questions here or generate them with AI above..."
                                className="min-h-[250px] font-mono text-sm mt-2"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={saveLoading}>
                            {saveLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Save Quiz
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
