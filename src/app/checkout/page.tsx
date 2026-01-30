'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { add } from 'date-fns';

const USD_TO_INR_RATE = 83; // Approximate conversion rate

function CheckoutComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const planParam = searchParams.get('plan');
  const priceUsd = searchParams.get('price');

  let planName = '';
  let priceInr = 0;
  let planId: 'pro-monthly' | 'pro-yearly' | null = null;

  if (planParam === 'pro-monthly' && priceUsd === '5') {
    planName = 'Pro Plan (Monthly)';
    priceInr = 5 * USD_TO_INR_RATE;
    planId = 'pro-monthly';
  } else if (planParam === 'pro-yearly' && priceUsd === '50') {
    planName = 'Pro Plan (Annually)';
    priceInr = 50 * USD_TO_INR_RATE;
    planId = 'pro-yearly';
  } else {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Invalid Plan</h2>
        <p className="text-muted-foreground">Please select a valid plan from the pricing page.</p>
        <Button asChild className="mt-4">
          <Link href="/pricing">Go to Pricing</Link>
        </Button>
      </div>
    );
  }
  
  const upiId = '9098191811@ybl';
  const recipientName = 'school quizes';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(recipientName)}&am=${priceInr.toFixed(2)}&cu=INR&tn=${encodeURIComponent(planName)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const handlePaymentConfirmation = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not logged in',
            description: 'You must be logged in to complete a purchase.'
        });
        router.push('/auth/login');
        return;
    }
    if (!planId) return;
    
    setIsProcessing(true);

    try {
        const userRef = doc(firestore, 'users', user.uid);
        const planDuration = planId === 'pro-monthly' ? { months: 1 } : { years: 1 };
        const expiryDate = add(new Date(), planDuration);

        await updateDoc(userRef, {
            plan: 'pro',
            planType: planId === 'pro-monthly' ? 'monthly' : 'yearly',
            planExpires: expiryDate,
        });

        toast({
            title: 'Purchase Successful!',
            description: 'Your Pro plan is now active.',
        });
        router.push('/dashboard');

    } catch (error) {
        console.error("Error updating user plan:", error);
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: 'Could not update your plan. Please contact support.',
        });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>Scan the QR code below with your favorite UPI app to complete the payment.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-muted-foreground">You are purchasing</p>
          <p className="text-xl font-bold">{planName}</p>
          <p className="text-4xl font-extrabold mt-2">₹{priceInr.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">(${priceUsd} USD)</p>
        </div>
        <div className="p-4 border-2 border-dashed rounded-lg">
           <Image
              src={qrCodeUrl}
              alt={`UPI QR Code for ${planName}`}
              width={250}
              height={250}
            />
        </div>
        <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Scan and pay using any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
            <p>Or pay to UPI ID: <span className="font-semibold text-foreground">{upiId}</span></p>
        </div>
         <Button onClick={handlePaymentConfirmation} disabled={isProcessing} className="w-full mt-4 bg-green-600 hover:bg-green-700">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            I have completed the payment
        </Button>
      </CardContent>
    </Card>
  );
}


export default function CheckoutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-16">
                     <Suspense fallback={<div>Loading...</div>}>
                        <CheckoutComponent />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </div>
    )
}
