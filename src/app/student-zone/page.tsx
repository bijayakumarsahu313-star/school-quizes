import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Award, LineChart } from "lucide-react";

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
            <Link href="/dashboard">Go to My Dashboard</Link>
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <Gamepad2 className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Gamified Quizzes</h3>
                <p className="text-muted-foreground mt-2">
                  Learning is a game. Play, compete, and conquer your subjects!
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Earn Badges & Points</h3>
                <p className="text-muted-foreground mt-2">
                  Show off your skills and collect rewards for your hard work.
                </p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/student-zone/badges">View Your Badges</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <LineChart className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Track Your Progress</h3>
                <p className="text-muted-foreground mt-2">
                  Watch yourself grow and see how you improve over time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
