'use client';
import { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { performanceData, quizzes, students } from '@/lib/data';
import { Badge } from "@/components/ui/badge";

const student = students[0]; // Assuming we are showing progress for the first student for demonstration

type SubjectDataType = {
    name: string;
    averageScore: number;
};

export default function ProgressPage() {
    const [subjectData, setSubjectData] = useState<SubjectDataType[]>([]);

    useEffect(() => {
        const studentPerformanceBySubject = quizzes
            .filter(q => q.status === 'Published')
            .reduce((acc, quiz) => {
            if (!acc[quiz.subject]) {
                acc[quiz.subject] = { name: quiz.subject, scores: [], count: 0 };
            }
            // Mocking student's score to be around the average for demo
            const studentScore = Math.max(0, Math.min(100, quiz.averageScore + (Math.random() - 0.5) * 10));
            acc[quiz.subject].scores.push(studentScore);
            acc[quiz.subject].count++;
            return acc;
        }, {} as Record<string, {name: string, scores: number[], count: number}>);

        const newSubjectData = Object.values(studentPerformanceBySubject).map(subject => ({
            name: subject.name,
            averageScore: subject.scores.reduce((a, b) => a + b, 0) / subject.count,
        }));
        setSubjectData(newSubjectData);
    }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Your Progress</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Keep up the great work, {student.name}!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Overall Average</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-5xl font-bold text-primary">{student.averageScore}%</div>
                </CardContent>
            </Card>
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Quizzes Completed</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-5xl font-bold text-primary">{student.quizzesCompleted}</div>
                </CardContent>
            </Card>
             <Card className="text-center">
                <CardHeader>
                    <CardTitle>Recent Badge</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant="default" className="text-lg">Science Star</Badge>
                     <p className="text-sm text-muted-foreground mt-2">Scored 90% on a Science quiz</p>
                </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Performance Trend</CardTitle>
                <CardDescription>Your average scores over the last six months.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="score" name="Your Score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
                <CardDescription>Your average scores across different subjects.</CardDescription>
              </CardHeader>
              <CardContent>
                {subjectData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjectData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="averageScore" name="Your Average Score" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>No performance data yet.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
