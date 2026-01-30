
'use client';
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
import { useUser, useFirestore } from '@/firebase';
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import type { Quiz, QuizResult } from '@/lib/data';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [allResults, setAllResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) return;

    const fetchAllResults = async () => {
      setLoading(true);
      try {
        // Find all quizzes created by the current teacher
        const quizzesRef = collection(firestore, 'quizzes');
        const teacherQuizzesQuery = query(quizzesRef, where('createdBy', '==', user.uid));
        const teacherQuizzesSnap = await getDocs(teacherQuizzesQuery);
        const teacherQuizIds = teacherQuizzesSnap.docs.map(doc => doc.id);
        const quizzesMap = new Map(teacherQuizzesSnap.docs.map(doc => [doc.id, doc.data() as Quiz]));

        if (teacherQuizIds.length === 0) {
            setAllResults([]);
            setLoading(false);
            return;
        }

        // Query the 'results' collection group for results belonging to any of the teacher's quizzes.
        // This requires a Firestore index. If one doesn't exist, the console will show an error
        // with a link to create it.
        const resultsQuery = query(collectionGroup(firestore, 'results'), where('quizId', 'in', teacherQuizIds));
        const resultsSnap = await getDocs(resultsQuery);
        
        const resultsData = resultsSnap.docs.map(doc => {
            const result = doc.data() as QuizResult;
            const quiz = quizzesMap.get(result.quizId);
            return {
                ...result,
                quizSubject: quiz?.subject || 'N/A', // Add subject for aggregation
            };
        });
        
        setAllResults(resultsData);
      } catch (error) {
        console.error("Error fetching analytics data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllResults();
  }, [user, firestore]);

  const { performanceByMonth, performanceBySubject } = useMemo(() => {
    if (allResults.length === 0) {
      return { performanceByMonth: [], performanceBySubject: [] };
    }

    // Aggregate by month
    const monthly: { [key: string]: number[] } = {};
    allResults.forEach(result => {
        if (result.completedAt) {
            const month = format(result.completedAt.toDate(), 'MMM yyyy');
            if (!monthly[month]) monthly[month] = [];
            monthly[month].push(result.score);
        }
    });

    const performanceByMonth = Object.entries(monthly)
      .map(([month, scores]) => ({
        month,
        score: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Aggregate by subject
    const bySubject: { [key: string]: number[] } = {};
    allResults.forEach(result => {
        const subject = result.quizSubject || 'General';
        if (!bySubject[subject]) bySubject[subject] = [];
        bySubject[subject].push(result.score);
    });

    const performanceBySubject = Object.entries(bySubject).map(([name, scores]) => ({
      name,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));
    
    return { performanceByMonth, performanceBySubject };

  }, [allResults]);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Performance Analytics</h1>
        <p className="text-muted-foreground">Dive deep into your classroom's performance data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Overall Performance Trend</CardTitle>
            <CardDescription>Average quiz scores over time across all quizzes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                {loading ? <Skeleton className="h-full w-full" /> : performanceByMonth.length > 0 ? (
                    <LineChart data={performanceByMonth}>
                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value)}%`} domain={[0, 100]} />
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value: number) => [`${value.toFixed(1)}%`, "Avg. Score"]} />
                        <Legend />
                        <Line type="monotone" dataKey="score" name="Average Score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No performance data yet.</div>
                )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
            <CardDescription>Average quiz scores across different subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                {loading ? <Skeleton className="h-full w-full" /> : performanceBySubject.length > 0 ? (
                    <BarChart data={performanceBySubject}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value: number) => [`${value.toFixed(1)}%`, "Avg. Score"]}/>
                        <Bar dataKey="averageScore" name="Average Score" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                     <div className="flex items-center justify-center h-full text-muted-foreground">No performance data yet.</div>
                )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
