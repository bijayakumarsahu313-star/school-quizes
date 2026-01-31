'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, getDocs } from 'firebase/firestore';
import { firestore as db } from "@/firebase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

type UserProfile = {
    id: string;
    name: string;
    email: string;
    school: string;
    class: string;
    role: 'student' | 'teacher';
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // This fetch will likely fail due to security rules if not authenticated as admin.
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
        // This error is expected if you are not logged in as an admin.
        // To fix this, you would need to implement admin authentication.
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>A list of all student and teacher accounts in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.school}</TableCell>
                  <TableCell>{user.class}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'teacher' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found or insufficient permissions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
