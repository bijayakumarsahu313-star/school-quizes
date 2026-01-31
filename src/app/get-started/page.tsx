'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, User, GraduationCap } from 'lucide-react';

export default function GetStartedPage() {
  const router = useRouter();
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    rollNo: '',
    school: '',
    class: '',
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setStudentDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('studentDetails', JSON.stringify(studentDetails));
    setIsOpen(false);
    router.push('/student-zone');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Are you a Teacher or a Student?</h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose your role to get started with the right set of tools and features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/teacher-tools" className="block h-full">
              <Card className="h-full text-card-foreground bg-card transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-2 group">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                        <GraduationCap className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">I'm a Teacher</CardTitle>
                    <CardDescription>
                      Access tools to create quizzes, manage your classes, and track student performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center text-primary font-semibold">
                    Go to Teacher Tools
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer h-full text-card-foreground bg-card transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-2 group">
                  <CardHeader>
                      <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                          <User className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">I'm a Student</CardTitle>
                      <CardDescription>
                        Take quizzes, practice your knowledge, and earn badges for your achievements.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center text-primary font-semibold">
                      Enter Student Zone
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Enter Student Details</DialogTitle>
                  <DialogDescription>
                    Please enter your details to proceed to the student zone.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleStudentSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" value={studentDetails.name} onChange={handleInputChange} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rollNo" className="text-right">
                        Roll No.
                      </Label>
                      <Input id="rollNo" value={studentDetails.rollNo} onChange={handleInputChange} className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="school" className="text-right">
                        School
                      </Label>
                      <Input id="school" value={studentDetails.school} onChange={handleInputChange} className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="class" className="text-right">
                        Class
                      </Label>
                      <Input id="class" value={studentDetails.class} onChange={handleInputChange} className="col-span-3" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Enter Zone</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
