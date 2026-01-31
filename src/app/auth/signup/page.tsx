
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore as db } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    const school = (form.elements.namedItem('school') as HTMLInputElement)?.value;
    const subject = (form.elements.namedItem('subject') as HTMLInputElement)?.value;
    const studentClass = (form.elements.namedItem('class') as HTMLInputElement)?.value;
    const board = (form.elements.namedItem('board') as HTMLInputElement)?.value;

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await updateProfile(user, { displayName: name });

      const userData: any = {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date(),
      };

      if (role === 'student') {
        userData.class = studentClass;
        userData.board = board;
      } else {
        userData.school = school;
        userData.subject = subject;
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      
      toast({
        title: "Signup Successful!",
        description: "Welcome! You will be logged in automatically.",
      });

      // Hard redirect to ensure all state is fresh.
      window.location.href = '/';
      
    } catch (err: any) {
       toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup defaultValue="student" onValueChange={setRole} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="role-student" />
                  <Label htmlFor="role-student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="role-teacher" />
                  <Label htmlFor="role-teacher">Teacher</Label>
                </div>
              </RadioGroup>
            </div>

            {role === 'student' ? (
              <div id="studentFields" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input id="class" name="class" placeholder="e.g., 10th A" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board">Board</Label>
                  <Input id="board" name="board" placeholder="e.g., CBSE, ICSE" required />
                </div>
              </div>
            ) : (
              <div id="teacherFields" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input id="school" name="school" placeholder="Your School Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="e.g., Mathematics" required />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
