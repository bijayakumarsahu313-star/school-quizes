
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

type FormValues = z.infer<typeof formSchema>;

const boards = [
    'CBSE', 'ICSE', 'IB', 'IGCSE', 'Maharashtra State Board', 'Tamil Nadu Board of Secondary Education', 'West Bengal Board of Secondary Education', 'UP Board', 'Other',
];

const buildUserProfile = (user: User, values: FormValues) => {
    const profile: any = {
        uid: user.uid,
        email: user.email!,
        fullName: values.fullName || user.displayName!,
        displayName: values.fullName || user.displayName!,
        photoURL: user.photoURL || null,
        role: values.role,
        school: values.school,
        plan: 'free',
    };

    if (values.role === 'student') {
        profile.classLevel = values.classLevel;
        profile.board = values.board;
    } else if (values.role === 'teacher') {
        profile.subject = values.subject;
    }
    
    return profile;
};

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState<'idle' | 'email' | 'google'>('idle');
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const authImage = PlaceHolderImages.find((img) => img.id === "auth-signup");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'student',
      fullName: '',
      email: '',
      school: '',
      password: '',
    },
  });
  
  const watchedFields = form.watch(['role', 'school', 'classLevel', 'board', 'subject']);
  const role = watchedFields[0];

  const isGoogleButtonDisabled = useMemo(() => {
    const [ role, school, classLevel, board, subject ] = watchedFields;
    if (!school) return true;
    if (role === 'student' && (!classLevel || !board)) {
        return true;
    }
    if (role === 'teacher' && !subject) {
        return true;
    }
    return false;
  }, [watchedFields]);

  const handleRedirect = (role: 'student' | 'teacher') => {
      if (role === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/student-zone');
      }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting('email');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.fullName });

      const userProfile = buildUserProfile(user, values);

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
      setIsSubmitting('idle');
    }
  };

  const handleGoogleSignIn = async () => {
    // Validation is now handled by disabling the button, so we can proceed directly.
    setIsSubmitting('google');
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const values = form.getValues();
      // For Google sign-in, we use the display name from Google if the form field is empty.
      const formValuesForProfile = { ...values, fullName: values.fullName || user.displayName || '' };
      
      const userProfile = buildUserProfile(user, formValuesForProfile);
      
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
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: 'destructive',
          title: 'Google Sign-Up Failed',
          description: error.message || 'Could not sign up with Google. Please try again.',
        });
      }
      setIsSubmitting('idle');
    }
  };

  return (
    <>
        <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[400px] gap-6">
                <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your information to create an account
                </p>
                </div>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>I am a...</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="student" disabled={isSubmitting !== 'idle'} />
                                        </FormControl>
                                        <FormLabel className="font-normal">Student</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="teacher" disabled={isSubmitting !== 'idle'} />
                                        </FormControl>
                                        <FormLabel className="font-normal">Teacher</FormLabel>
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
                                <Input placeholder="Max Robinson" {...field} disabled={isSubmitting !== 'idle'} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="m@example.com" {...field} disabled={isSubmitting !== 'idle'} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="school" render={({ field }) => (
                        <FormItem>
                            <FormLabel>School</FormLabel>
                            <FormControl>
                                <Input placeholder="Springfield High School" {...field} disabled={isSubmitting !== 'idle'} />
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
                                    <Input type="number" placeholder="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || '')} disabled={isSubmitting !== 'idle'} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="board" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Board</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting !== 'idle'}>
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
                                    <Input placeholder="e.g., Physics, History" {...field} value={field.value ?? ''} disabled={isSubmitting !== 'idle'} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    )}

                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} disabled={isSubmitting !== 'idle'} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <Button type="submit" className="w-full" disabled={isSubmitting !== 'idle'}>
                        {isSubmitting === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create an account
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button 
                        variant="outline" 
                        className="w-full" 
                        type="button" 
                        onClick={handleGoogleSignIn} 
                        disabled={isSubmitting !== 'idle' || isGoogleButtonDisabled}
                        title={isGoogleButtonDisabled ? 'Please fill out your role-specific information first.' : 'Sign up with Google'}
                    >
                        {isSubmitting === 'google' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            </div>
        </div>
      <div className="hidden bg-muted lg:block">
        {authImage && (
            <Image
                src={authImage.imageUrl}
                alt={authImage.description}
                width="1920"
                height="1080"
                className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                data-ai-hint={authImage.imageHint}
            />
        )}
      </div>
    </>
  );
}
