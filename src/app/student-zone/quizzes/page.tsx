
'use client';

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useCollection } from "@/firebase";
import type { Quiz } from "@/lib/data";

export default function StudentQuizzesPage() {
  const { data: publishedQuizzes, loading } = useCollection<Quiz>('quizzes', 'status', 'Published');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Available Quizzes</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Choose a quiz to test your knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <p>Loading quizzes...</p>
            ) : publishedQuizzes && publishedQuizzes.length > 0 ? (
              publishedQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.subject} - Class {quiz.classLevel}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{quiz.questions.length} Questions</span>
                    <span>{quiz.duration} minutes</span>
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button asChild className="w-full">
                        <Link href={`/quiz/${quiz.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Take Quiz
                        </Link>
                    </Button>
                </div>
              </Card>
            ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No quizzes available at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
