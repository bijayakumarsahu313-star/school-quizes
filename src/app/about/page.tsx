import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === "feature-teacher");
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">About QuizWhiz Academy</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Empowering educators and inspiring students through innovative technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              {aboutImage && (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                  data-ai-hint={aboutImage.imageHint}
                />
              )}
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-headline text-primary">Our Mission</h2>
              <p className="text-muted-foreground text-lg">
                Our mission is to make education accessible, engaging, and effective for every student. We believe that learning should be a joyful discovery, not a chore. By providing teachers with the best tools, we empower them to create dynamic learning environments where students can thrive.
              </p>
              <h2 className="text-3xl font-bold font-headline text-primary">Our Vision</h2>
              <p className="text-muted-foreground text-lg">
                We envision a world where every classroom is a hub of curiosity and knowledge. QuizWhiz Academy aims to be the leading platform for educational assessment, continuously innovating to meet the evolving needs of teachers and students globally, and fostering a lifelong love for learning.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
