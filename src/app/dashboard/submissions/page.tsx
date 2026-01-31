'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { firestore as db } from "@/firebase/client";
import { useState, useEffect } from "react";
import { format } from 'date-fns';

type Submission = {
    id: string;
    quizId: string;
    userId: string;
    school: string;
    class: string;
    score: number;
    submittedAt: { toDate: () => Date };
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        // This fetch will likely fail due to security rules if not authenticated as admin.
        const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedSubmissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
        setSubmissions(fetchedSubmissions);
      } catch (error) {
        console.error("Error fetching submissions: ", error);
        // This error is expected if you are not logged in as an admin.
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Submissions</CardTitle>
        <CardDescription>A list of all quiz submissions from students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Quiz ID</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading submissions...
                </TableCell>
              </TableRow>
            ) : submissions.length > 0 ? (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-mono text-xs">{submission.userId}</TableCell>
                  <TableCell className="font-mono text-xs">{submission.quizId}</TableCell>
                  <TableCell>{submission.school}</TableCell>
                  <TableCell>{submission.class}</TableCell>
                  <TableCell className="text-right font-medium">{submission.score}%</TableCell>
                  <TableCell className="text-right">{submission.submittedAt ? format(submission.submittedAt.toDate(), 'PPpp') : 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No submissions found or insufficient permissions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
