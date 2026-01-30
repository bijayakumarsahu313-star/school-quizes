
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question, Quiz, QuizResult } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';
import { useDoc, useUser, useFirestore } from '@/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

// Helper function to shuffle an array
function shuffle(array: any[]) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Helper function to format time
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}


export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { user } = useUser();
  const firestore = useFirestore();

  const { data: quizData, loading: quizLoading } = useDoc<Quiz>('quizzes', quizId);
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showVisibilityWarning, setShowVisibilityWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (quizLoading) return;

    if (quizData) {
      const quizWithShuffled = { ...quizData };
      quizWithShuffled.questions = shuffle([...quizData.questions]);
      setQuiz(quizWithShuffled);
      setShuffledQuestions(quizWithShuffled.questions);
      setTimeLeft(quizWithShuffled.duration * 60);
    } else {
      router.push('/student-zone/quizzes');
    }
  }, [quizId, router, quizData, quizLoading]);

  // Anti-cheating: Tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setShowVisibilityWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFinished]);

  // Anti-cheating: Back button and page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinished) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
        return e.returnValue;
      }
    };
    
    const handlePopState = () => {
        if (!isFinished) {
            window.history.pushState(null, '', window.location.href);
            alert("Navigating back is not allowed during the quiz.");
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFinished]);

  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting || !user || !quiz) return;
    setIsSubmitting(true);

    let correctAnswers = 0;
    shuffledQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctAnswers++;
      }
    });
    
    const finalScore = (correctAnswers / shuffledQuestions.length) * 100;
    setScore(finalScore);

    const resultData: Omit<QuizResult, 'id'> = {
      quizId: quiz.id,
      userId: user.uid,
      studentName: user.displayName || 'Anonymous',
      studentAvatar: user.photoURL || '',
      score: finalScore,
      completedAt: serverTimestamp(),
      answers: selectedAnswers,
    };

    try {
      const resultRef = doc(firestore, 'quizzes', quiz.id, 'results', user.uid);
      await setDoc(resultRef, resultData);
    } catch (error) {
      console.error("Failed to save quiz result:", error);
      // Optionally show a toast to the user
    }

    setIsFinished(true);
  }, [isSubmitting, selectedAnswers, shuffledQuestions, user, quiz, firestore]);


  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || isFinished) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(t => (t !== null ? t - 1 : null));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isFinished, handleSubmitQuiz]);


  const handleAnswerSelect = (option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  if (quizLoading || !quiz) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading quiz...</p>
        </div>
    );
  }
  
  if (isFinished) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle>Quiz Completed!</CardTitle>
                    <CardDescription>You have successfully submitted the quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg mb-2">Your Score:</p>
                    <p className="text-6xl font-bold text-primary">{score.toFixed(0)}%</p>
                     <Button onClick={() => router.push('/student-zone/quizzes')} className="mt-8">
                        Back to Quizzes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4">
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{quiz.title}</span>
                     <span className="flex items-center text-lg font-mono text-primary">
                        <Clock className="mr-2 h-5 w-5" />
                        {timeLeft !== null ? formatTime(timeLeft) : '...'}
                    </span>
                </CardTitle>
                 <CardDescription>
                    Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                </CardDescription>
                <Progress value={progress} className="w-full mt-2" />
            </CardHeader>
            <CardContent>
                <p className="text-lg font-semibold mb-6">{currentQuestion.text}</p>
                <RadioGroup
                    value={selectedAnswers[currentQuestionIndex] || ""}
                    onValueChange={handleAnswerSelect}
                    className="space-y-4"
                >
                    {currentQuestion.options.map((option, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-border has-[[data-state=checked]]:border-primary">
                             <RadioGroupItem value={option} id={`option-${i}`} />
                             <Label htmlFor={`option-${i}`} className="text-base font-normal flex-1 cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
             <div className="p-6 pt-0 flex justify-end">
                {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                    <Button onClick={handleNextQuestion} disabled={!selectedAnswers[currentQuestionIndex]}>Next</Button>
                ) : (
                    <Button onClick={handleSubmitQuiz} disabled={!selectedAnswers[currentQuestionIndex] || isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Quiz
                    </Button>
                )}
            </div>
        </Card>
        
        <AlertDialog open={showVisibilityWarning}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Warning: Tab Switch Detected</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have switched tabs or minimized the window. This is against the rules.
                        Further violations may result in the quiz being automatically submitted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setShowVisibilityWarning(false)}>I Understand</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
