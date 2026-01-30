import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { students } from "@/lib/data";

export default function StudentsPage() {
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
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Quizzes Completed</TableHead>
              <TableHead className="text-center">Average Score</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell className="text-center">{student.quizzesCompleted}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={student.averageScore > 85 ? "default" : "secondary"}>
                    {student.averageScore}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {/* Future actions like 'View Report' */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
