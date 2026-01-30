'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection } from "@/firebase";
import type { UserProfile } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const { data: students, loading } = useCollection<UserProfile>('users', 'role', 'student');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Roster</CardTitle>
        <CardDescription>View and manage all students in your classes.</CardDescription>
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
                        No students found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
