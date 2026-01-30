import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { badges } from "@/lib/badges";

export default function BadgesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Your Badges</h1>
            <p className="text-lg text-muted-foreground mt-2">
              A collection of your achievements and milestones.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {badges.map((badge) => (
              <Card key={badge.id} className="text-center">
                <CardHeader>
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                    {badge.icon}
                  </div>
                  <CardTitle>{badge.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{badge.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
