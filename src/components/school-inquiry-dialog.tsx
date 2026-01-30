
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Check } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  schoolName: z.string().min(1, 'School name is required.'),
  schoolAddress: z.string().min(1, 'School address is required.'),
  board: z.string().min(1, 'Educational board is required.'),
  principalName: z.string().min(1, "Principal's name is required."),
  contactName: z.string().min(1, 'Contact person name is required.'),
  contactEmail: z.string().email('Please enter a valid email.'),
  contactPhone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SchoolInquiryDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: '',
      schoolAddress: '',
      board: '',
      principalName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const inquiryData = {
        ...values,
        submittedAt: serverTimestamp(),
      };
      const inquiriesCollection = collection(firestore, 'schoolInquiries');
      await addDoc(inquiriesCollection, inquiryData);
      
      setIsSubmitted(true);
      form.reset();
    } catch (error: any) {
      console.error('Failed to submit inquiry:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'An unexpected error occurred. Please try again or contact us directly.',
      });
       const permissionError = new FirestorePermissionError({
          path: collection(firestore, 'schoolInquiries').path,
          operation: 'create',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset state when dialog is closed
    if (!open) {
      setIsSubmitted(false);
      setIsSubmitting(false);
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Check className="h-16 w-16 text-green-500 bg-green-100 rounded-full p-2 mb-4" />
            <DialogTitle className="text-2xl mb-2">Thank You!</DialogTitle>
            <DialogDescription className="mb-6">
              Your inquiry has been received. Our team will review the details and get back to you shortly.
            </DialogDescription>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>School Plan Inquiry</DialogTitle>
              <DialogDescription>
                Please provide some details about your institution. We'll get back to you with a customized quote.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="schoolName" render={({ field }) => ( <FormItem> <FormLabel>School Name</FormLabel> <FormControl> <Input placeholder="e.g., Springfield International School" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="schoolAddress" render={({ field }) => ( <FormItem> <FormLabel>School Address</FormLabel> <FormControl> <Textarea placeholder="Full school address" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="board" render={({ field }) => ( <FormItem> <FormLabel>Board (CBSE, ICSE, etc.)</FormLabel> <FormControl> <Input placeholder="e.g., CBSE" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="principalName" render={({ field }) => ( <FormItem> <FormLabel>Principal's Name</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="contactName" render={({ field }) => ( <FormItem> <FormLabel>Your Name</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                     <FormField control={form.control} name="contactEmail" render={({ field }) => ( <FormItem> <FormLabel>Your Email</FormLabel> <FormControl> <Input type="email" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                 <FormField control={form.control} name="contactPhone" render={({ field }) => ( <FormItem> <FormLabel>Your Phone Number (Optional)</FormLabel> <FormControl> <Input type="tel" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Inquiry
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
