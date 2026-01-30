'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/logo';

export default function SignupPage() {
  const [role, setRole] = useState('student');

  const boards = [
    'CBSE',
    'ICSE',
    'IB',
    'IGCSE',
    'Maharashtra State Board',
    'Tamil Nadu Board of Secondary Education',
    'West Bengal Board of Secondary Education',
    'UP Board',
    'Other',
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
        <Logo />
        <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
            <div className="grid gap-2">
                <Label>Are you a?</Label>
                <RadioGroup defaultValue="student" onValueChange={setRole} className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="r1" />
                    <Label htmlFor="r1">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="r2" />
                    <Label htmlFor="r2">Teacher</Label>
                </div>
                </RadioGroup>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="Max Robinson" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="school">School</Label>
                <Input id="school" placeholder="Springfield High School" required />
            </div>

            {role === 'student' && (
                <>
                <div className="grid gap-2">
                    <Label htmlFor="class-level">Class</Label>
                    <Input id="class-level" type="number" placeholder="10" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="board">Board</Label>
                    <Select>
                    <SelectTrigger id="board">
                        <SelectValue placeholder="Select your board" />
                    </SelectTrigger>
                    <SelectContent>
                        {boards.map((board) => (
                        <SelectItem key={board} value={board.toLowerCase().replace(/ /g, '-')}>
                            {board}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                </>
            )}

            {role === 'teacher' && (
                <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Physics, History" required />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
            </div>

            <Button type="submit" className="w-full">
                Create an account
            </Button>
            <Button variant="outline" className="w-full">
                Sign up with Google
            </Button>
            </div>
            <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline">
                Login
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
