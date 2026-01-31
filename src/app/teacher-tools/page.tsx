'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookOpen, PieChart, Target, Loader2 } from "lucide-react";

const tools = [
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: "AI-Assisted Question Generation",
    description: "Save time by generating curriculum-aligned questions in seconds.",
    href: "/dashboard/quizzes/create",
  },
  {
    icon: <BookOpen className="h-10 w-10 text-primary" />,
    title: "Extensive Question Bank",
    description: "Access and customize a vast library of questions across all subjects.",
    href: "/dashboard/quizzes",
  },
  {
    icon: <Target className="h-10 w-10 text-primary" />,
    title: "Auto-Grading & Instant Results",
    description: "Get immediate feedback on student performance without manual grading.",
    href: "/dashboard/analytics",
  },
  {
    icon: <PieChart className="h-10 w-10 text-primary" />,
    title: "Reports & Analytics",
    description: "Track progress and identify learning gaps with our powerful analytics.",
    href: "/dashboard/analytics",
  },
];

export default function TeacherToolsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This check runs only on the client-side
    const teacherAuth = sessionStorage.getItem('isTeacherAuthenticated');
    if (teacherAuth !== 'true') {
      router.replace('/get-started');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Verifying access...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Powerful Tools for Modern Teachers</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Streamline your workflow, engage your students, and make data-driven decisions.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/dashboard">Go to Teacher Dashboard</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tools.map((tool) => (
              <Link href={tool.href} key={tool.title} className="block h-full">
                <Card className="text-center h-full hover:border-primary transition-colors flex flex-col">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                      {tool.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                    <p className="text-muted-foreground text-sm">{tool.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
