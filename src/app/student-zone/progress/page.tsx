'use client';
import { useState, useEffect, useMemo } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc } from '@/firebase';
import type { Quiz, QuizResult, UserProfile } from '@/lib/data';
import { getDocs, collection, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgressPage() {
    const { user } = useUser();
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user ? user.uid : null);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        if (!user || !firestore) return;

        setLoading(true);
        const fetchResults = async () => {
            try {
                // 1. Fetch all published quizzes to get their details
                const quizzesQuery = query(collection(firestore, 'quizzes'), where('status', '==', 'Published'));
                const quizSnap = await getDocs(quizzesQuery);
                const quizzesMap = new Map<string, Quiz>();
                quizSnap.forEach(doc => quizzesMap.set(doc.id, { id: doc.id, ...doc.data() } as Quiz));

                // 2. Construct promises to fetch the user's result for each quiz
                const resultPromises = Array.from(quizzesMap.keys()).map(quizId =>
                    getDoc(doc(firestore, `quizzes/${quizId}/results/${user.uid}`))
                );
                
                const resultSnaps = await Promise.all(resultPromises);

                // 3. Filter out non-existent results and combine with quiz details
                const userResults = resultSnaps
                    .filter(snap => snap.exists())
                    .map(snap => {
                        const resultData = snap.data() as QuizResult;
                        const quizData = quizzesMap.get(resultData.quizId);
                        return {
                            id: snap.id,
                            ...resultData,
                            quizTitle: quizData?.title || 'Unknown Quiz',
                            quizSubject: quizData?.subject || 'Unknown Subject',
                        };
                    });
                
                setResults(userResults);
            } catch (error) {
                console.error("Error fetching quiz results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user, firestore]);

    const {
        overallAverage,
        quizzesCompleted,
        performanceByMonth,
        performanceBySubject
    } = useMemo(() => {
        if (results.length === 0) {
            return {
                overallAverage: 0,
                quizzesCompleted: 0,
                performanceByMonth: [],
                performanceBySubject: [],
            };
        }

        const totalScore = results.reduce((acc, r) => acc + r.score, 0);
        const overallAverage = totalScore / results.length;

        const monthlyPerformance: { [key: string]: { scores: number[], count: number } } = {};
        results.forEach(r => {
            const month = format((r.completedAt as Timestamp).toDate(), 'MMM yyyy');
            if (!monthlyPerformance[month]) {
                monthlyPerformance[month] = { scores: [], count: 0 };
            }
            monthlyPerformance[month].scores.push(r.score);
            monthlyPerformance[month].count++;
        });

        const performanceByMonth = Object.entries(monthlyPerformance)
            .map(([month, data]) => ({
                month,
                score: data.scores.reduce((a, b) => a + b, 0) / data.count,
            }))
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        const subjectPerformance: { [key: string]: { scores: number[], count: number } } = {};
        results.forEach(r => {
            const subject = r.quizSubject || 'General';
            if (!subjectPerformance[subject]) {
                subjectPerformance[subject] = { scores: [], count: 0 };
            }
            subjectPerformance[subject].scores.push(r.score);
            subjectPerformance[subject].count++;
        });
        
        const performanceBySubject = Object.entries(subjectPerformance).map(([name, data]) => ({
            name,
            averageScore: data.scores.reduce((a, b) => a + b, 0) / data.count,
        }));

        return {
            overallAverage,
            quizzesCompleted: results.length,
            performanceByMonth,
            performanceBySubject,
        };
    }, [results]);

  if (profileLoading) {
    return (
         <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <p>Loading your profile...</p>
            </main>
            <Footer />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Your Progress</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Keep up the great work, {userProfile?.fullName || 'Student'}!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Overall Average</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-12 w-2/3 mx-auto" /> : <div className="text-5xl font-bold text-primary">{overallAverage.toFixed(0)}%</div>}
                </CardContent>
            </Card>
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Quizzes Completed</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-12 w-1/3 mx-auto" /> : <div className="text-5xl font-bold text-primary">{quizzesCompleted}</div>}
                </CardContent>
            </Card>
             <Card className="text-center">
                <CardHeader>
                    <CardTitle>Recent Badge</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant="default" className="text-lg">Science Star</Badge>
                     <p className="text-sm text-muted-foreground mt-2">(Demo) Scored 90% on a Science quiz</p>
                </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Performance Trend</CardTitle>
                <CardDescription>Your average scores over time.</CardDescription>
              </CardHeader>
              <CardContent>
                 {loading ? <div className="h-[300px] flex items-center justify-center"><p>Loading chart data...</p></div> : 
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceByMonth}>
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                            <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="score" name="Your Score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                 }
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
                <CardDescription>Your average scores across different subjects.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <div className="h-[300px] flex items-center justify-center"><p>Loading chart data...</p></div> :
                    performanceBySubject.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceBySubject}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`}/>
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="averageScore" name="Your Average Score" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>No performance data yet. Take a quiz to get started!</p>
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

