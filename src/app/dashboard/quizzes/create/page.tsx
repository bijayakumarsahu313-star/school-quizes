'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/firebase/client';
import type { Question } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Sparkles, PlusCircle, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';
import type { GenerateQuizInput } from '@/ai/schemas';

export default function CreateQuizPage() {
    const [saveLoading, setSaveLoading] = useState(false);
    const [generateLoading, setGenerateLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const router = useRouter();
    const { toast } = useToast();
    const [school, setSchool] = useState('');
    const [creatorId, setCreatorId] = useState('');

    useEffect(() => {
        const adminDetailsString = sessionStorage.getItem('adminDetails');
        if (adminDetailsString) {
            try {
                const admin = JSON.parse(adminDetailsString);
                if (admin.school) {
                    setSchool(admin.school);
                }
                if (admin.adminId) {
                    setCreatorId(admin.adminId);
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
            subject: formData.get('subject') as string | undefined,
            className: formData.get('className') as string | undefined,
            pdfDataUri: pdfDataUri,
        };
    
        try {
            const generatedQuestions = await generateQuiz(input);
            setQuestions(generatedQuestions);
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
        const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
        const className = (form.elements.namedItem('class') as HTMLInputElement).value;

        if (questions.length === 0) {
             toast({ title: "No Questions", description: "Please add questions before saving.", variant: "destructive" });
             setSaveLoading(false);
             return;
        }

        const isDataValid = questions.every(q => 
            q.question.trim() !== '' && 
            q.options.length >= 2 && 
            q.options.every(opt => opt.trim() !== '') &&
            q.correctAnswer && 
            q.options.includes(q.correctAnswer)
        );

        if (!isDataValid) {
            toast({ title: "Incomplete Quiz", description: "Please ensure every question has text, at least two filled options, and a correct answer selected.", variant: "destructive" });
            setSaveLoading(false);
            return;
        }

        if (!school) {
            toast({ title: "Error", description: "School information not found. Please log in again.", variant: "destructive" });
            setSaveLoading(false);
            return;
        }

        if (!creatorId) {
            toast({ title: "Error", description: "Creator information not found. Please log in again.", variant: "destructive" });
            setSaveLoading(false);
            return;
       }

        try {
            const quizData = {
                title,
                subject,
                questions,
                school,
                class: className,
                creatorId: creatorId,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "quizzes"), quizData)
            toast({ title: "Success!", description: "Quiz created and saved." });
            router.push('/dashboard/quizzes');

        } catch (error: any) {
            console.error("Error creating quiz:", error);
            toast({ title: "Error creating quiz", description: error.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };
    
    const handleQuestionChange = (qIndex: number, field: 'question' | 'correctAnswer', value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        const question = newQuestions[qIndex];
        const oldOptionValue = question.options[oIndex];
        
        question.options[oIndex] = value;
        
        if (question.correctAnswer === oldOptionValue) {
             question.correctAnswer = value;
        }
        setQuestions(newQuestions);
    };

    const handleAddQuestion = () => {
        setQuestions(prev => [...prev, { question: '', options: ['', ''], correctAnswer: '' }]);
    };

    const handleRemoveQuestion = (qIndex: number) => {
        setQuestions(prev => prev.filter((_, index) => index !== qIndex));
    };

    const handleAddOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        const question = newQuestions[qIndex];
        
        if (question.options.length <= 2) return;
        
        const removedOption = question.options[oIndex];
        question.options.splice(oIndex, 1);
        
        if (question.correctAnswer === removedOption) {
            question.correctAnswer = '';
        }

        setQuestions(newQuestions);
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
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" placeholder="e.g., History" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Quiz Title</Label>
                                <Input id="title" name="title" placeholder="e.g., The Solar System" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="subject-save">Subject</Label>
                                <Input id="subject-save" name="subject" placeholder="e.g., Science" required />
                            </div>
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
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Questions & Answers</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Question
                                </Button>
                            </div>
                            {questions.length > 0 ? (
                                <div className="space-y-6 pt-2">
                                    {questions.map((q, qIndex) => (
                                        <Card key={qIndex} className="bg-muted/30 p-4">
                                            <CardHeader className="flex flex-row items-center justify-between p-2">
                                                <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveQuestion(qIndex)} className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove Question</span>
                                                </Button>
                                            </CardHeader>
                                            <CardContent className="space-y-4 p-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`question-text-${qIndex}`} className="text-sm font-medium">Question Text</Label>
                                                    <Textarea 
                                                        id={`question-text-${qIndex}`}
                                                        value={q.question} 
                                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                        placeholder="Enter the question"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Options</Label>
                                                    <div className="space-y-2">
                                                        {q.options.map((opt, oIndex) => (
                                                            <div key={oIndex} className="flex items-center gap-2">
                                                                <Input 
                                                                    id={`option-${qIndex}-${oIndex}`}
                                                                    value={opt}
                                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                    placeholder={`Option ${oIndex + 1}`}
                                                                />
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                    disabled={q.options.length <= 2}
                                                                    onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                    <span className="sr-only">Remove Option</span>
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddOption(qIndex)} className="mt-2">
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        Add Option
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`correct-answer-${qIndex}`} className="text-sm font-medium">Correct Answer</Label>
                                                    <Select 
                                                        value={q.correctAnswer} 
                                                        onValueChange={(value) => handleQuestionChange(qIndex, 'correctAnswer', value)}
                                                    >
                                                        <SelectTrigger id={`correct-answer-${qIndex}`}>
                                                            <SelectValue placeholder="Select correct answer" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {q.options.filter(opt => opt.trim() !== '').map((opt, oIndex) => (
                                                                <SelectItem key={oIndex} value={opt}>{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {q.correctAnswer && !q.options.includes(q.correctAnswer) && (
                                                        <p className="text-xs text-destructive">The correct answer must be one of the options.</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 mt-2 bg-muted/50 rounded-lg border border-dashed text-center text-muted-foreground">
                                    <p>Your questions will appear here.</p>
                                    <p className="text-xs">Use the "Generate Quiz with AI" tool above or "Add Question" to start.</p>
                                </div>
                            )}
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
