'use client';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { badgeInfos, iconMap } from "@/lib/badges";

export default function BadgesPage() {
  // In a real app, you'd filter these based on user's achievements
  // Reversing the array to show the most recently earned badges first.
  const earnedBadges = [...badgeInfos].reverse();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Your Achievements</h1>
            <p className="text-lg text-muted-foreground mt-2">
              A collection of all the badges you've earned. Keep up the great work!
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {earnedBadges.map((badge) => {
              const Icon = iconMap[badge.iconName];
              return (
                <Card key={badge.id} className="text-center transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col">
                  <CardHeader className="flex-grow">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-4 transform-gpu transition-transform group-hover:scale-110">
                      <Icon className={`h-16 w-16 ${badge.iconColor} transition-colors`} />
                    </div>
                    <CardTitle>{badge.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{badge.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
