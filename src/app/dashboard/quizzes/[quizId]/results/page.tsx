'use client';

import { useParams } from 'next/navigation';
import { quizzes, students } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, BarChart, Users, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


type Result = {
  studentName: string;
  studentAvatar: string;
  score: number;
};

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const quiz = quizzes.find((q) => q.id === quizId);

  const [results, setResults] = useState<Result[]>([]);
  const [analytics, setAnalytics] = useState({
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
    participantCount: 0,
  });

  useEffect(() => {
    if (quiz) {
      // Simulate student results for a published quiz
      const simulatedResults = quiz.status === 'Published' 
        ? students.map((student) => ({
            studentName: student.name,
            studentAvatar: student.avatar,
            // Generate a random score between 40 and 100 for a more realistic distribution
            score: Math.floor(Math.random() * 61) + 40,
          }))
        : [];
      
      setResults(simulatedResults.sort((a, b) => b.score - a.score));

      if (simulatedResults.length > 0) {
        const scores = simulatedResults.map((r) => r.score);
        const totalScore = scores.reduce((acc, score) => acc + score, 0);
        setAnalytics({
          averageScore: totalScore / scores.length,
          highestScore: Math.max(...scores),
          lowestScore: Math.min(...scores),
          participantCount: scores.length,
        });
      }
    }
  }, [quiz]);

  if (!quiz) {
    return <div className="text-center py-10">Quiz not found.</div>;
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Quiz Results: {quiz.title}</h1>
        <p className="text-muted-foreground">{quiz.subject} - Class {quiz.class}</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.participantCount}</div>
            <p className="text-xs text-muted-foreground">students have completed the quiz</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.highestScore}%</div>
            <p className="text-xs text-muted-foreground">Top performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowestScore}%</div>
            <p className="text-xs text-muted-foreground">Area for improvement</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>Individual scores for all participants.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.length > 0 ? results.map((result, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium text-center">{index + 1}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={result.studentAvatar} alt={result.studentName} />
                                        <AvatarFallback>{result.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{result.studentName}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                               <Badge variant={result.score > analytics.averageScore ? "default" : "secondary"}>
                                    {result.score}%
                               </Badge>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">
                                No results yet. Waiting for students to complete the quiz.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
