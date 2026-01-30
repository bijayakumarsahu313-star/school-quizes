
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser, useCollection, useFirestore } from '@/firebase';
import type { Quiz } from '@/lib/data';
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Share2, Eye, EyeOff } from "lucide-react";

export default function QuizzesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { data: quizzes, loading } = useCollection<Quiz>(
    user ? 'quizzes' : null,
    'createdBy',
    user?.uid
  );

  const togglePublishStatus = async (quiz: Quiz) => {
    if (!firestore) return;
    const newStatus = quiz.status === 'Published' ? 'Draft' : 'Published';
    const quizRef = doc(firestore, 'quizzes', quiz.id);
    try {
      await updateDoc(quizRef, { status: newStatus });
      toast({
        title: 'Quiz Updated',
        description: `"${quiz.title}" is now ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the quiz status.',
      });
    }
  };

  const shareQuiz = (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied!',
      description: 'Quiz URL has been copied to your clipboard.',
    });
  };

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
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
                  <TableCell className="text-center">
                    <Badge variant={quiz.status === 'Published' ? 'default' : 'secondary'}>
                      {quiz.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/quizzes/${quiz.id}/results`} className="w-full justify-start cursor-pointer flex items-center">Results</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublishStatus(quiz)} className="cursor-pointer">
                            {quiz.status === 'Published' ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                            <span>{quiz.status === 'Published' ? 'Unpublish' : 'Publish'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareQuiz(quiz.id)} className="cursor-pointer">
                           <Share2 className="mr-2 h-4 w-4" />
                           <span>Share</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
