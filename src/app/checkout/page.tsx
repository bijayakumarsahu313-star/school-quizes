'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const USD_TO_INR_RATE = 83; // Approximate conversion rate

function CheckoutComponent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const priceUsd = searchParams.get('price');

  let planName = '';
  let priceInr = 0;

  if (plan === 'pro-monthly' && priceUsd === '5') {
    planName = 'Pro Plan (Monthly)';
    priceInr = 5 * USD_TO_INR_RATE;
  } else if (plan === 'pro-yearly' && priceUsd === '50') {
    planName = 'Pro Plan (Annually)';
    priceInr = 50 * USD_TO_INR_RATE;
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
         <Button asChild className="w-full mt-4 bg-green-600 hover:bg-green-700">
            <Link href="/dashboard">
                <CheckCircle className="mr-2 h-4 w-4" /> I have completed the payment
            </Link>
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
