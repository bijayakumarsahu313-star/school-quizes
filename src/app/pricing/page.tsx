
'use client';

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const studentFeatures = [
  "Take quizzes assigned by teachers",
  "Generate practice quizzes on any topic",
  "View your results instantly",
  "Earn achievement badges",
];

const teacherFeatures = [
  "Access to all quizzes",
  "View class-wide analytics (coming soon)",
  "Manage school and class data (coming soon)",
  "Everything is completely free",
];


export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Free for Everyone</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Our mission is to improve education. That's why our platform is free.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
            <Card className="border-primary shadow-lg">
              <CardHeader>
                <CardTitle>For Students</CardTitle>
                <CardDescription>Test your knowledge and have fun learning.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">Free</div>
                <ul className="space-y-2">
                  {studentFeatures.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/student-zone">Go to Student Zone</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Teachers</CardTitle>
                <CardDescription>Empowering educators with the best tools.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="text-4xl font-bold">Free</div>
                 <ul className="space-y-2">
                  {teacherFeatures.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                  <Button asChild className="w-full" variant="secondary">
                    <Link href="/dashboard">Go to Teacher Dashboard</Link>
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
