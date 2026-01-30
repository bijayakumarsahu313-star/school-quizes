'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Users,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { performanceData, students as mockStudents } from '@/lib/data';
import { useUser, useCollection } from '@/firebase';
import type { Quiz, UserProfile } from '@/lib/data';


export default function Dashboard() {
  const { user } = useUser();
  const { data: quizzes, loading: quizzesLoading } = useCollection<Quiz>('quizzes', 'createdBy', user?.uid);
  const { data: students, loading: studentsLoading } = useCollection<UserProfile>('users', 'role', 'student');

  const totalStudents = studentsLoading ? '...' : students.length;
  const totalQuizzes = quizzesLoading ? '...' : (quizzes?.length ?? 0);
  const publishedQuizzes = quizzes ? quizzes.filter(q => q.status === 'Published').length : 0;
  
  // Note: Average score is still using mock logic as real-time calculation is complex.
  const averageScore =
    quizzes && quizzes.length > 0 
      ? quizzes.reduce((acc, q) => acc + (q.averageScore || 0), 0) / quizzes.length 
      : 75; // fallback mock value

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome Back, Teacher!</h1>
                <p className="text-muted-foreground">Here's a snapshot of your classroom's performance.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard/quizzes/create">Create New Quiz</Link>
            </Button>
        </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              across all schools
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Created</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              {quizzesLoading ? '...' : publishedQuizzes} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              (demo data)
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Quiz Performance</CardTitle>
            <CardDescription>Average scores over the last 6 months (demo data).</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Top Students</CardTitle>
              <CardDescription>
                (demo data)
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/students">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-8">
            {mockStudents
              .sort((a, b) => b.averageScore - a.averageScore)
              .slice(0, 4)
              .map((student) => (
                <div key={student.id} className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={student.avatar} alt="Avatar" />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {student.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Class {student.class}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{student.averageScore}%</div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
