'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/logo';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  role: z.enum(['student', 'teacher']),
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  school: z.string().min(1, 'School name is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  classLevel: z.coerce.number().optional(),
  board: z.string().optional(),
  subject: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'student') {
        if (!data.classLevel || data.classLevel < 1 || data.classLevel > 12) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please enter a valid class level (1-12).",
                path: ["classLevel"],
            });
        }
        if (!data.board) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Board is required for students.",
                path: ["board"],
            });
        }
    }
    if (data.role === 'teacher' && (!data.subject || data.subject.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Subject is required for teachers.",
            path: ["subject"],
        });
    }
});


export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const boards = [
    'CBSE', 'ICSE', 'IB', 'IGCSE', 'Maharashtra State Board', 'Tamil Nadu Board of Secondary Education', 'West Bengal Board of Secondary Education', 'UP Board', 'Other',
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'student',
      fullName: '',
      email: '',
      school: '',
      password: '',
    },
  });
  
  const role = form.watch('role');

  const handleRedirect = (role: 'student' | 'teacher') => {
      if (role === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/student-zone');
      }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.fullName });

      const userProfile: any = {
        uid: user.uid,
        email: values.email,
        fullName: values.fullName,
        displayName: values.fullName,
        photoURL: user.photoURL,
        role: values.role,
        school: values.school,
        plan: 'free',
      };
      
      if (values.role === 'student') {
        userProfile.classLevel = values.classLevel;
        userProfile.board = values.board;
      } else if (values.role === 'teacher') {
        userProfile.subject = values.subject;
      }

      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      
      toast({
        title: 'Account Created!',
        description: "Welcome! We're redirecting you...",
      });
      handleRedirect(values.role);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.code === 'auth/email-already-in-use' 
            ? 'This email is already in use. Please login.'
            : (error.message || 'An unexpected error occurred. Please try again.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await form.trigger(['role', 'school', 'classLevel', 'board', 'subject']);
    if (!result) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: "Please fill out the required fields for your role before signing up with Google.",
        });
        return;
    }
      
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const values = form.getValues();

      const userProfile: any = {
        uid: user.uid,
        email: user.email!,
        fullName: user.displayName!,
        displayName: user.displayName!,
        photoURL: user.photoURL!,
        role: values.role,
        school: values.school,
        plan: 'free',
      };
      
      if (values.role === 'student') {
        userProfile.classLevel = values.classLevel;
        userProfile.board = values.board;
      } else if (values.role === 'teacher') {
        userProfile.subject = values.subject;
      }
      
      await setDoc(doc(firestore, 'users', user.uid), userProfile, { merge: true });

      toast({
        title: 'Signed In!',
        description: `Welcome, ${user.displayName}!`,
      });
      handleRedirect(values.role);

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast({
          variant: 'destructive',
          title: 'Account Already Exists',
          description: "This email is already in use. Please go to the login page and use your original sign-in method.",
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Google Sign-Up Failed',
          description: error.message || 'Could not sign up with Google. Please try again.',
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Logo />
        <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Are you a?</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4 pt-2"
                                >
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                    <RadioGroupItem value="student" />
                                    </FormControl>
                                    <Label>Student</Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                    <RadioGroupItem value="teacher" />
                                    </FormControl>
                                    <Label>Teacher</Label>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Max Robinson" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="school" render={({ field }) => (
                     <FormItem>
                        <FormLabel>School</FormLabel>
                        <FormControl>
                            <Input placeholder="Springfield High School" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                {role === 'student' && (
                <>
                    <FormField control={form.control} name="classLevel" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || '')} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="board" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Board</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your board" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {boards.map((board) => (
                                    <SelectItem key={board} value={board}>
                                        {board}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                </>
                )}

                {role === 'teacher' && (
                    <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Physics, History" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                )}

                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create an account
                </Button>

                <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
                     {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign up with Google
                </Button>
            </form>
            </Form>
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
