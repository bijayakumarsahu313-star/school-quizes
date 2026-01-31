'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoc, useFirestore, useUser } from "@/firebase";
import type { UserProfile } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function StudentsPage() {
  const { user } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user?.uid);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore || !userProfile?.school) {
      if (!profileLoading) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    const studentsQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'student'),
      where('school', '==', userProfile.school)
    );

    const unsubscribe = onSnapshot(studentsQuery, 
      (snapshot) => {
        const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setStudents(studentData);
        setLoading(false);
      }, 
      (error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, userProfile, profileLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Roster</CardTitle>
        <CardDescription>View and manage all students in your school.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>School</TableHead>
              <TableHead className="text-center">Class</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                ))
            ) : students && students.length > 0 ? (
                students.map((student) => (
                    <TableRow key={student.uid}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={student.photoURL} alt={student.fullName} />
                                <AvatarFallback>{student.fullName.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.fullName}</span>
                        </div>
                        </TableCell>
                        <TableCell>{student.school}</TableCell>
                        <TableCell className="text-center">{student.classLevel || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                        {/* Future actions like 'View Report' */}
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No students found for your school.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
