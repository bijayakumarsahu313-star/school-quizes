import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const freeFeatures = [
  "Up to 3 quizzes per month",
  "AI question generation (10/month)",
  "Basic analytics",
  "Access to public question bank",
];

const proFeatures = [
  "Up to 50 quizzes per month",
  "AI question generation (200/month)",
  "Standard analytics",
  "Save & Edit quizzes",
  "Priority email support",
];

const schoolFeatures = [
  "Unlimited quizzes",
  "Unlimited AI question generation",
  "Advanced analytics and reports",
  "Custom curriculum support",
  "School-wide student management",
  "Dedicated account manager",
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Choose the plan that's right for you or your school.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            <Card>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>For individual teachers to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary shadow-lg">
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>For the dedicated educator.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline">
                    <span className="text-4xl font-bold">$5</span>
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">or $50 billed annually</p>
                <ul className="space-y-2">
                  {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-col gap-2 items-stretch">
                <Button asChild className="w-full">
                  <Link href="/checkout?plan=pro-monthly&price=5">Go Pro Monthly</Link>
                </Button>
                 <Button asChild className="w-full" variant="outline">
                  <Link href="/checkout?plan=pro-yearly&price=50">Go Pro Annually</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School Plan</CardTitle>
                <CardDescription>For schools and institutions looking for a complete solution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">Custom</div>
                 <ul className="space-y-2">
                  {schoolFeatures.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
