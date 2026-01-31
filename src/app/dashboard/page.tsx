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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser, useCollection, useDoc, useFirestore } from '@/firebase';
import type { Quiz, UserProfile } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const { user } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user?.uid);
  const { data: quizzes, loading: quizzesLoading } = useCollection<Quiz>(user ? 'quizzes' : null, 'createdBy', user?.uid);
  
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore || !userProfile?.school) {
      if (!profileLoading) {
        setStudentsLoading(false);
      }
      return;
    }

    setStudentsLoading(true);
    const studentsQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'student'),
      where('school', '==', userProfile.school)
    );

    const unsubscribe = onSnapshot(studentsQuery, 
      (snapshot) => {
        const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setStudents(studentData);
        setStudentsLoading(false);
      }, 
      (error) => {
        console.error("Error fetching students:", error);
        setStudentsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, userProfile, profileLoading]);

  const totalStudents = studentsLoading ? '...' : students.length;
  const totalQuizzes = quizzesLoading ? '...' : (quizzes?.length ?? 0);
  
  const recentQuizzes = quizzes
    ? [...quizzes]
        .sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0))
        .slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome Back, {userProfile?.fullName || 'Teacher'}!</h1>
                <p className="text-muted-foreground">Here's a snapshot of your classroom's activity.</p>
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
              in your school
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
              {quizzes ? `${quizzes.filter(q => q.status === 'Published').length} published` : '...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">View Analytics</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/analytics" className="underline">Go to the Analytics page for detailed insights</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Quizzes</CardTitle>
            <CardDescription>A list of your 5 most recently created quizzes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quizzesLoading ? (
                        <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell></TableRow>
                    ) : recentQuizzes.length > 0 ? (
                        recentQuizzes.map(quiz => (
                            <TableRow key={quiz.id}>
                                <TableCell className="font-medium">{quiz.title}</TableCell>
                                <TableCell>
                                    <Badge variant={quiz.status === 'Published' ? 'default' : 'secondary'}>
                                        {quiz.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/dashboard/quizzes/${quiz.id}/results`}>View Results</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={3} className="h-24 text-center">No quizzes created yet.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Student Roster</CardTitle>
              <CardDescription>
                A preview of students in your school.
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
            {studentsLoading ? (
                <div className="text-center text-muted-foreground">Loading students...</div>
            ) : students.length > 0 ? (
                students.slice(0, 4).map((student) => (
                <div key={student.uid} className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={student.photoURL} alt="Avatar" />
                    <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Class {student.classLevel}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">No students found for your school.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
