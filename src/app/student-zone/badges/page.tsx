'use client';
import { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { badgeInfos, iconMap } from "@/lib/badges";
import { cn } from '@/lib/utils';

export default function BadgesPage() {
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // In a real app, this would be fetched from a database.
    // For now, we use sessionStorage to persist earned badges.
    const storedBadges = sessionStorage.getItem('earnedBadges');
    if (storedBadges) {
      setEarnedBadgeIds(new Set(JSON.parse(storedBadges)));
    }
  }, []);
  
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
            {badgeInfos.map((badge) => {
              const Icon = iconMap[badge.iconName];
              const isEarned = earnedBadgeIds.has(badge.id);
              return (
                <Card 
                  key={badge.id} 
                  className={cn(
                    "text-center transition-transform transform hover:scale-105 flex flex-col",
                    isEarned ? "hover:shadow-lg" : "bg-gray-100 dark:bg-gray-800/50"
                  )}
                >
                  <CardHeader className="flex-grow">
                    <div className={cn(
                      "mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-4 transform-gpu transition-all",
                      !isEarned && "grayscale opacity-50"
                    )}>
                      <Icon className={cn("h-16 w-16 transition-colors", isEarned ? badge.iconColor : 'text-gray-400')} />
                    </div>
                    <CardTitle className={cn(!isEarned && "text-muted-foreground")}>{badge.title}</CardTitle>
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
