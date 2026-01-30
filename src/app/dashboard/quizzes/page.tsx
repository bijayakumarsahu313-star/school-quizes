
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser, useCollection } from '@/firebase';
import type { Quiz } from '@/lib/data';

export default function QuizzesPage() {
  const { user } = useUser();
  const { data: quizzes, loading } = useCollection<Quiz>(
    user ? 'quizzes' : null,
    'createdBy',
    user?.uid
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Quizzes</CardTitle>
          <CardDescription>Manage, edit, and view performance for all your quizzes.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/quizzes/create">Create New Quiz</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Questions</TableHead>
              <TableHead className="text-center">Avg. Score</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading quizzes...
                </TableCell>
              </TableRow>
            ) : quizzes && quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.subject}</TableCell>
                  <TableCell>{quiz.classLevel}</TableCell>
                  <TableCell className="text-center">{quiz.questions.length}</TableCell>
                  <TableCell className="text-center">{quiz.averageScore || 0}%</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={quiz.status === 'Published' ? 'default' : 'secondary'}>
                      {quiz.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/quizzes/${quiz.id}/results`}>Results</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  You haven't created any quizzes yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
