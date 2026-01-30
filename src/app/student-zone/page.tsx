
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Award, LineChart, BrainCircuit } from "lucide-react";

export default function StudentZonePage() {
  const menuItems = [
    {
      href: "/student-zone/quizzes",
      icon: Gamepad2,
      title: "Take a Quiz",
      description: "Browse and take quizzes assigned by your teachers.",
    },
    {
      href: "/student-zone/generate-quiz",
      icon: BrainCircuit,
      title: "Practice Quiz",
      description: "Generate a custom quiz on any topic to test your knowledge.",
    },
    {
      href: "/student-zone/badges",
      icon: Award,
      title: "Your Badges",
      description: "Check out all the cool badges you've earned.",
    },
    {
      href: "/student-zone/progress",
      icon: LineChart,
      title: "Track Progress",
      description: "Watch yourself grow and see how you improve over time.",
    },
  ];

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
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} className="block h-full">
                  <Card className="h-full text-card-foreground bg-card transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1 group">
                    <CardContent className="p-6 text-center">
                      <Icon className="h-12 w-12 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-2">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
