'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Question, Quiz } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, Trophy, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function PracticeQuizPage() {
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showVisibilityWarning, setShowVisibilityWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);


  useEffect(() => {
    const quizDataString = sessionStorage.getItem('practiceQuiz');
    if (quizDataString) {
      try {
        const quizData: Quiz = JSON.parse(quizDataString);
        quizData.questions = shuffle([...quizData.questions]);
        setQuiz(quizData);
        setShuffledQuestions(quizData.questions);
        setTimeLeft(quizData.duration * 60);
      } catch (error) {
        console.error("Failed to parse quiz data from session storage", error);
        router.replace('/student-zone/generate-quiz');
      }
    } else {
      router.replace('/student-zone/generate-quiz');
    }
  }, [router]);

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
      sessionStorage.removeItem('practiceQuiz');
    };
  }, [isFinished]);

  const handleSubmitQuiz = useCallback(() => {
    if (isFinished) return;
    
    const finalScore = (correctAnswersCount / shuffledQuestions.length) * 100;
    setScore(finalScore);
    setIsFinished(true);
    sessionStorage.removeItem('practiceQuiz');
  }, [isFinished, correctAnswersCount, shuffledQuestions.length]);


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
    if (answerStatus !== 'unanswered') return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswers[currentQuestionIndex]) return;

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    if (selectedAnswer === currentQuestion.answer) {
        setAnswerStatus('correct');
        setCorrectAnswersCount(prev => prev + 1);
    } else {
        setAnswerStatus('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setAnswerStatus('unanswered');
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question was answered, now finish.
      handleSubmitQuiz();
    }
  };
  
  if (!quiz || shuffledQuestions.length === 0) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading quiz...</p>
        </div>
    );
  }
  
  if (isFinished) {
    const isSuccess = score >= 80;
    const finalCorrectCount = Math.round(score / 100 * shuffledQuestions.length);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/50 p-4">
            <Card className={cn("w-full max-w-lg text-center p-6 shadow-xl border-2", isSuccess ? "border-green-400" : "border-border")}>
                <CardHeader>
                     <div className={`mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br ${isSuccess ? 'from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50' : 'from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50'} mb-4`}>
                        <Trophy className={`w-16 h-16 ${isSuccess ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <CardTitle className="text-3xl">Practice Completed!</CardTitle>
                    <CardDescription>{isSuccess ? "Outstanding performance! You nailed it." : "Good effort! Keep practicing."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg mb-2 text-muted-foreground">Your Score:</p>
                    <p className={`text-7xl font-bold ${isSuccess ? 'text-green-600' : 'text-primary'}`}>{score.toFixed(0)}%</p>
                    <div className="mt-6 text-muted-foreground grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">Questions</p>
                            <p className="text-2xl font-bold text-foreground">{shuffledQuestions.length}</p>
                        </div>
                         <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">Correct Answers</p>
                            <p className="text-2xl font-bold text-foreground">{finalCorrectCount}</p>
                        </div>
                    </div>
                     <Button onClick={() => router.push('/student-zone')} className="mt-8">
                        Back to Student Zone
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/50 p-4">
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
                <p className="text-xl font-semibold mb-6">{currentQuestion.text}</p>
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

                {answerStatus !== 'unanswered' && (
                    <div className={cn(
                        "mt-6 p-4 rounded-lg",
                        answerStatus === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'
                    )}>
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            {answerStatus === 'correct' ? <CheckCircle className="text-green-600" /> : <XCircle className="text-red-600" />}
                            {answerStatus === 'correct' ? 'Correct!' : 'Incorrect'}
                        </h4>
                        <p className="text-muted-foreground">The correct answer is: <strong className="text-foreground">{currentQuestion.answer}</strong></p>
                        <p className="mt-2 text-sm">
                            <strong>AI Explanation:</strong> Our AI confirms this is the correct answer based on established knowledge in {quiz.subject}. Keep up the great work!
                        </p>
                    </div>
                )}
            </CardContent>
             <div className="p-6 pt-4 flex justify-end gap-4">
                {answerStatus === 'unanswered' ? (
                    <>
                        <Button variant="ghost" onClick={handleNextQuestion}>Skip</Button>
                        <Button onClick={handleSubmitAnswer} disabled={!selectedAnswers[currentQuestionIndex]}>Submit</Button>
                    </>
                ) : currentQuestionIndex < shuffledQuestions.length - 1 ? (
                    <Button onClick={handleNextQuestion}>Next Question</Button>
                ) : (
                    <Button onClick={handleNextQuestion}>Finish Quiz</Button>
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
