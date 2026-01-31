'use client';

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { firestore as db } from "@/firebase/client";
import type { Quiz } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { BookCopy, HelpCircle, Sigma, BrainCircuit } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'quizzes'));
        const querySnapshot = await getDocs(q);
        const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  const { totalQuizzes, totalQuestions, avgQuestionsPerQuiz, schoolDistribution, questionsPerQuiz } = useMemo(() => {
    if (quizzes.length === 0) {
      return {
        totalQuizzes: 0,
        totalQuestions: 0,
        avgQuestionsPerQuiz: 0,
        schoolDistribution: [],
        questionsPerQuiz: [],
      };
    }

    const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);

    const schoolCounts = quizzes.reduce((acc: Record<string, number>, quiz) => {
      const school = quiz.school || 'Unknown';
      acc[school] = (acc[school] || 0) + 1;
      return acc;
    }, {});
    const schoolDistribution = Object.entries(schoolCounts).map(([name, value]) => ({ name, value }));

    const questionsPerQuiz = quizzes.map(quiz => ({
      name: quiz.title.length > 20 ? `${quiz.title.substring(0, 17)}...` : quiz.title,
      questions: quiz.questions.length
    }));

    return {
      totalQuizzes: quizzes.length,
      totalQuestions,
      avgQuestionsPerQuiz: quizzes.length > 0 ? totalQuestions / quizzes.length : 0,
      schoolDistribution,
      questionsPerQuiz,
    };
  }, [quizzes]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-1/2" /></CardContent></Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
           <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
           <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>No quiz data available to generate reports.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-12">
                <BrainCircuit className="h-24 w-24 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-bold">No Quizzes Found</h3>
                <p className="text-muted-foreground">
                    Create your first quiz to see analytics here.
                </p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                    <BookCopy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalQuizzes}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalQuestions}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Questions per Quiz</CardTitle>
                    <Sigma className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgQuestionsPerQuiz.toFixed(1)}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Questions per Quiz</CardTitle>
                    <CardDescription>A look at the length of each quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={questionsPerQuiz} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))"
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="questions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Quiz Distribution by School</CardTitle>
                    <CardDescription>Where are the quizzes being created?</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie
                                data={schoolDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                    return (percent > 0.05) ? (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    ) : null;
                                }}
                            >
                                {schoolDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))"
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="text-primary" />
                    AI-Powered Student Analytics
                </CardTitle>
                <CardDescription>
                This feature is under construction. Student performance data is required.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-12">
                <h3 className="text-xl font-bold">Coming Soon!</h3>
                <p className="text-muted-foreground">
                    Once students begin taking quizzes, our AI will analyze their performance to provide deep insights into learning gaps and subject mastery.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
