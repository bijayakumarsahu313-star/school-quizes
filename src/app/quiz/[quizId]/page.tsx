'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { firestore as db } from '@/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useBadges } from '@/hooks/use-badges';

type QuizData = {
    id: string;
    title: string;
    subject: string;
    questions: Question[];
};

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { awardBadges } = useBadges();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
        setLoading(true);
        const quizDocRef = doc(db, 'quizzes', quizId);
        const quizDocSnap = await getDoc(quizDocRef);

        if (quizDocSnap.exists()) {
            const data = quizDocSnap.data();
            setQuiz({ 
                id: quizDocSnap.id,
                title: data.title,
                subject: data.subject,
                questions: data.questions
             } as QuizData);
        } else {
            alert('Quiz not found!');
            router.push('/student-zone');
        }
        setLoading(false);
    };

    fetchQuiz();
  }, [quizId, router]);


  const handleFinishQuiz = useCallback(() => {
    if (!quiz) return;
    
    let correct = 0;
    quiz.questions.forEach((q, index) => {
        if (q.answer === selectedAnswers[index]) {
            correct++;
        }
    });
    const finalScore = (correct / quiz.questions.length) * 100;
    setScore(finalScore);
    setIsFinished(true);

    awardBadges(finalScore, quiz.subject);
  }, [quiz, selectedAnswers, awardBadges]);

  const handleAnswerSelect = (option: string) => {
    if (answerStatus !== 'unanswered') return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedAnswers[currentQuestionIndex] || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    if (selectedAnswer === currentQuestion.answer) {
        setAnswerStatus('correct');
        setCorrectAnswersCount(prev => prev + 1);
    } else {
        setAnswerStatus('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setAnswerStatus('unanswered');
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };
  
  if (loading || !quiz) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading quiz...</p>
        </div>
    );
  }
  
  if (isFinished) {
    const isSuccess = score >= 80;
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/50 p-4">
            <Card className={cn("w-full max-w-lg text-center p-6 shadow-xl border-2", isSuccess ? "border-green-400" : "border-border")}>
                <CardHeader>
                     <div className={`mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br ${isSuccess ? 'from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50' : 'from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50'} mb-4`}>
                        <Trophy className={`w-16 h-16 ${isSuccess ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
                    <CardDescription>{isSuccess ? "Outstanding performance! You nailed it." : "Good effort! Keep practicing."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg mb-2 text-muted-foreground">Your Score:</p>
                    <p className={`text-7xl font-bold ${isSuccess ? 'text-green-600' : 'text-primary'}`}>{score.toFixed(0)}%</p>
                     <Button onClick={() => router.push('/student-zone/quizzes')} className="mt-8">
                        Back to Quizzes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/50 p-4">
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                 <CardDescription>
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </CardDescription>
                <Progress value={progress} className="w-full mt-2" />
            </CardHeader>
            <CardContent>
                <p className="text-xl font-semibold mb-6">{currentQuestion.question}</p>
                 <RadioGroup
                    value={selectedAnswers[currentQuestionIndex] || ""}
                    onValueChange={handleAnswerSelect}
                    className="space-y-4"
                    disabled={answerStatus !== 'unanswered'}
                >
                    {currentQuestion.options.map((option, i) => {
                       const isSelected = selectedAnswers[currentQuestionIndex] === option;
                       const isCorrect = currentQuestion.answer === option;
                       let variantClass = "border-border bg-background hover:border-primary/50";

                       if (answerStatus !== 'unanswered') {
                           if (isCorrect) {
                               variantClass = "border-green-500 bg-green-500/10 text-green-700 font-bold shadow-md";
                           } else if (isSelected && !isCorrect) {
                               variantClass = "border-red-500 bg-red-500/10 text-red-700 font-bold shadow-md";
                           }
                       } else if (isSelected) {
                           variantClass = "border-primary bg-primary/10 shadow-md";
                       }
                        return (
                            <Label
                                key={i}
                                htmlFor={`option-${i}`}
                                className={cn(
                                    "flex items-center space-x-4 p-5 rounded-lg border-2 transition-all",
                                    answerStatus === 'unanswered' ? "cursor-pointer" : "cursor-default",
                                    variantClass
                                )}
                            >
                                <RadioGroupItem value={option} id={`option-${i}`} className="h-5 w-5" />
                                <span className="text-base font-medium flex-1">{option}</span>
                                {answerStatus !== 'unanswered' && isCorrect && <CheckCircle className="h-6 w-6 text-green-500" />}
                                {answerStatus !== 'unanswered' && !isCorrect && isSelected && <XCircle className="h-6 w-6 text-red-500" />}
                            </Label>
                        )
                    })}
                </RadioGroup>
            </CardContent>
             <div className="p-6 pt-4 flex justify-end gap-4">
                {answerStatus === 'unanswered' ? (
                    <Button onClick={handleSubmitAnswer} disabled={!selectedAnswers[currentQuestionIndex]}>Submit</Button>
                ) : (
                    <Button onClick={handleNextQuestion}>
                      {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                )}
            </div>
        </Card>
    </div>
  );
}
