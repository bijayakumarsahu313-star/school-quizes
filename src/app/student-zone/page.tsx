
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Award, LineChart, BrainCircuit } from "lucide-react";

export default function StudentZonePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-blue-50 dark:bg-blue-900/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Welcome to the Student Zone!</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Ready to have some fun while you learn? Your next challenge awaits.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/student-zone/quizzes">Take a Quiz</Link>
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-6xl mx-auto">
            <Link href="/student-zone/quizzes" className="block h-full group">
              <Card className="h-full transition-all duration-300 group-hover:bg-primary/90 group-hover:text-primary-foreground group-hover:border-primary">
                <CardContent className="p-6 text-center">
                  <Gamepad2 className="h-12 w-12 text-accent mx-auto mb-4 transition-colors group-hover:text-primary-foreground" />
                  <h3 className="text-xl font-semibold">Take a Quiz</h3>
                  <p className="text-muted-foreground mt-2 transition-colors group-hover:text-primary-foreground/80">
                    Browse and take quizzes assigned by your teachers.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/student-zone/generate-quiz" className="block h-full group">
              <Card className="h-full transition-all duration-300 group-hover:bg-primary/90 group-hover:text-primary-foreground group-hover:border-primary">
                <CardContent className="p-6 text-center">
                  <BrainCircuit className="h-12 w-12 text-accent mx-auto mb-4 transition-colors group-hover:text-primary-foreground" />
                  <h3 className="text-xl font-semibold">Practice Quiz</h3>
                  <p className="text-muted-foreground mt-2 transition-colors group-hover:text-primary-foreground/80">
                    Generate a custom quiz on any topic to test your knowledge.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/student-zone/badges" className="block h-full group">
              <Card className="h-full transition-all duration-300 group-hover:bg-primary/90 group-hover:text-primary-foreground group-hover:border-primary">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-accent mx-auto mb-4 transition-colors group-hover:text-primary-foreground" />
                  <h3 className="text-xl font-semibold">Your Badges</h3>
                  <p className="text-muted-foreground mt-2 transition-colors group-hover:text-primary-foreground/80">
                    Check out all the cool badges you've earned.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/student-zone/progress" className="block h-full group">
              <Card className="h-full transition-all duration-300 group-hover:bg-primary/90 group-hover:text-primary-foreground group-hover:border-primary">
                <CardContent className="p-6 text-center">
                  <LineChart className="h-12 w-12 text-accent mx-auto mb-4 transition-colors group-hover:text-primary-foreground" />
                  <h3 className="text-xl font-semibold">Track Progress</h3>
                  <p className="text-muted-foreground mt-2 transition-colors group-hover:text-primary-foreground/80">
                    Watch yourself grow and see how you improve over time.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
