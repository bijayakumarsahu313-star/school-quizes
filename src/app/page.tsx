import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  PieChart,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Quiz Generation',
    description:
      'Instantly create engaging quizzes tailored to any subject, grade, and difficulty level with our advanced AI.',
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Versatile Question Bank',
    description:
      'Support for MCQs, True/False, Fill in the Blanks, and even image-based questions to make learning interactive.',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Curriculum Alignment',
    description:
      'Align quizzes with CBSE, ICSE, State Boards, or your custom syllabus to match your teaching goals perfectly.',
  },
  {
    icon: <PieChart className="h-8 w-8 text-primary" />,
    title: 'Insightful Analytics',
    description:
      'Get detailed reports on student performance to identify learning gaps and track progress effectively.',
  },
];

const testimonials = [
  {
    name: 'Mrs. Sharma',
    title: '8th Grade Science Teacher',
    image: 'https://picsum.photos/seed/t1/100/100',
    quote:
      "QuizWhiz Academy has transformed how I assess my students. The AI quiz generator is a lifesaver, and the detailed analytics help me tailor my teaching.",
  },
  {
    name: 'Rohan V.',
    title: '10th Grade Student',
    image: 'https://picsum.photos/seed/t2/100/100',
    quote:
      "Studying for tests used to be boring, but the gamified quizzes on this platform make it fun! I love earning badges and competing with my friends.",
  },
  {
    name: 'Principal Verma',
    title: 'Springfield Public School',
    image: 'https://picsum.photos/seed/t3/100/100',
    quote:
      'We implemented QuizWhiz for our entire school, and the results have been outstanding. Teacher efficiency is up, and student engagement has never been higher.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-students');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-accent/50 text-accent">
                    The Future of Learning is Here
                  </Badge>
                  <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Create, Engage, and Evaluate with AI-Powered Quizzes
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    QuizWhiz Academy helps teachers build world-class quizzes in minutes,
                    making learning interactive and fun for students from Class 1 to 12.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      For Teachers
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/student-zone">
                    <Button size="lg" variant="secondary">
                      For Students
                    </Button>
                  </Link>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                  A Smarter Way to Teach and Learn
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with powerful features designed for modern educators and
                  eager learners.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 xl:grid-cols-4 mt-12">
              {features.slice(0, 2).map((feature) => (
                <div key={feature.title} className="grid gap-1 text-center md:text-left md:flex md:items-start md:gap-4">
                  {feature.icon}
                  <div className="grid gap-1">
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
               {features.slice(2, 4).map((feature) => (
                <div key={feature.title} className="grid gap-1 text-center md:text-left md:flex md:items-start md:gap-4">
                  {feature.icon}
                  <div className="grid gap-1">
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Loved by Teachers and Students Alike
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Don't just take our word for it. Here's what people are saying about QuizWhiz Academy.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 pt-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Avatar className="mb-4 h-16 w-16">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="mb-4 text-sm text-muted-foreground">"{testimonial.quote}"</p>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-primary text-primary-foreground py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Revolutionize Your Classroom?
            </h2>
            <p className="mx-auto mt-4 max-w-xl md:text-lg">
              Join thousands of educators and students who are making learning more effective and enjoyable.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
