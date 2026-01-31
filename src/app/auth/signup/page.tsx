'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import type { UserProfile } from '@/lib/data';
import { useAuth, useFirestore, errorEmitter } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z
  .object({
    fullName: z.string().min(1, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    schoolName: z.string().min(1, { message: 'School name is required.' }),
    role: z.enum(['student', 'teacher'], { required_error: 'You must select a role.' }),
    subject: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'teacher') {
      if (!data.subject || data.subject.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Subject is required.',
          path: ['subject'],
        });
      }
    }
  });

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<'idle' | 'email' | 'google'>('idle');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      schoolName: '',
      subject: '',
    },
  });

  const role = form.watch('role');

  const teacherField = form.watch('subject');
  const isGoogleDisabled =
    (role === 'teacher' && !teacherField) || !role;

  const buildUserProfile = (
    uid: string,
    values: z.infer<typeof formSchema>
  ): Omit<UserProfile, 'id' | 'planExpires' | 'classLevel' | 'board'> => {
    const profile: Partial<UserProfile> = {
      uid,
      email: values.email,
      fullName: values.fullName,
      displayName: values.fullName,
      school: values.schoolName,
      role: values.role,
      plan: 'free',
    };
    if (values.role === 'teacher' && values.subject) {
      profile.subject = values.subject;
    }
    return profile as Omit<UserProfile, 'id' | 'planExpires' | 'classLevel' | 'board'>;
  };

  const handleUserCreation = async (
    user: any,
    provider: 'email' | 'google',
    formValues: z.infer<typeof formSchema>
  ) => {
    const finalValues: z.infer<typeof formSchema> = {
      ...formValues,
      email: user.email!,
      fullName: provider === 'google' ? user.displayName! : formValues.fullName,
    };

    try {
      if (provider === 'email') {
        await updateProfile(user, { displayName: finalValues.fullName });
      }

      const userProfileData = buildUserProfile(user.uid, finalValues);
      const userDocRef = doc(firestore, 'users', user.uid);

      await setDoc(userDocRef, userProfileData);

      toast({
        title: 'Account Created!',
        description: "You're all set. Welcome aboard!",
      });

      if (finalValues.role === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/student-zone');
      }
    } catch (error: any) {
      console.error('Error during user profile creation:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not save your user profile. Please contact support.',
      });
      if (error.code?.includes('permission-denied')) {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'create',
          requestResourceData: buildUserProfile(user.uid, finalValues),
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting('email');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await handleUserCreation(userCredential.user, 'email', values);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Email Already in Use',
          description: 'Please use a different email or log in.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: error.message,
        });
      }
    } finally {
      setIsSubmitting('idle');
    }
  }

  async function handleGoogleSignIn() {
    const formValues = form.getValues();
    setIsSubmitting('google');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleUserCreation(result.user, 'google', formValues);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // Do nothing, user cancelled
      } else {
        toast({
          variant: 'destructive',
          title: 'Google Sign In Failed',
          description: error.message,
        });
      }
    } finally {
      setIsSubmitting('idle');
    }
  }

  const signupImage = PlaceHolderImages.find((img) => img.id === 'auth-signup');

  return (
    <>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Or{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:text-primary/90">
                sign in to your existing account
              </Link>
            </p>
          </div>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Springfield University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === 'teacher' && (
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div>
                <Button
                  type="submit"
                  className="group relative flex w-full justify-center"
                  disabled={isSubmitting !== 'idle'}
                >
                  {isSubmitting === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </div>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting !== 'idle' || isGoogleDisabled}
              title={isGoogleDisabled ? 'Please select a role and fill required fields' : 'Sign up with Google'}
            >
              {isSubmitting === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 58.2l-67.2 64.7C324.7 97.4 289.3 80 248 80c-81.6 0-147.2 65.6-147.2 147.2s65.6 147.2 147.2 147.2c97.9 0 130.5-73.3 135.3-109.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
              )}
              Sign up with Google
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative">
        {signupImage && (
          <Image
            src={signupImage.imageUrl}
            alt={signupImage.description}
            width={1080}
            height={1920}
            className="absolute inset-0 h-full w-full object-cover"
            data-ai-hint={signupImage.imageHint}
          />
        )}
      </div>
    </>
  );
}
