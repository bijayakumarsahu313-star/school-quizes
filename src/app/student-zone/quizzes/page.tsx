
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pencil } from "lucide-react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import type { Quiz, UserProfile } from "@/lib/data";
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function ChangeClassDialog({ user }: { user: any }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [newClass, setNewClass] = useState('');

    const handleSave = async () => {
        if (!user || !newClass) return;
        const classLevel = parseInt(newClass, 10);
        if (isNaN(classLevel) || classLevel < 1 || classLevel > 12) {
            toast({
                variant: 'destructive',
                title: "Invalid Class",
                description: "Please enter a number between 1 and 12."
            });
            return;
        }

        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, { classLevel: classLevel });
        toast({
            title: "Class Updated!",
            description: "Your quiz list will now be updated.",
        });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="w-3 h-3" />
                    Change Class
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Your Class Level</DialogTitle>
                    <DialogDescription>
                        Enter your new class to see relevant quizzes. This will update your profile.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="class-level" className="text-right">
                            Class
                        </Label>
                        <Input
                            id="class-level"
                            type="number"
                            value={newClass}
                            onChange={(e) => setNewClass(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g., 9"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function StudentQuizzesPage() {
    const { user, loading: userLoading } = useUser();
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user?.uid);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        if (profileLoading || !userProfile?.classLevel) {
            if (!profileLoading && !userLoading) setLoadingQuizzes(false);
            return;
        }
        if (!firestore) return;

        setLoadingQuizzes(true);
        const fetchQuizzes = async () => {
            try {
                const q = query(
                    collection(firestore, 'quizzes'),
                    where('classLevel', '==', userProfile.classLevel)
                );

                const querySnapshot = await getDocs(q);
                const fetchedQuizzes = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as Quiz))
                    .filter(quiz => quiz.status === 'Published');
                
                setQuizzes(fetchedQuizzes);
            } catch (error) {
                console.error("Failed to fetch quizzes:", error);
                setQuizzes([]);
            } finally {
                setLoadingQuizzes(false);
            }
        }

        fetchQuizzes();

    }, [firestore, userProfile, profileLoading, userLoading]);

    const isLoading = userLoading || profileLoading || loadingQuizzes;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-gray-50 dark:bg-gray-900/10">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold font-headline">Available Quizzes</h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Choose a quiz to test your knowledge.
                        </p>
                    </div>

                    <div className="flex justify-center mb-12 items-center gap-4">
                        {userProfile && userProfile.classLevel && (
                            <>
                                <p className="text-muted-foreground">
                                    Showing quizzes for <span className="font-bold text-foreground">Class {userProfile.classLevel}</span>
                                </p>
                                {user && <ChangeClassDialog user={user} />}
                            </>
                        )}
                        {(userLoading || profileLoading) && !userProfile?.classLevel && <Skeleton className="h-8 w-48" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                         <div className="flex justify-between items-center text-sm text-muted-foreground">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                       <Skeleton className="h-10 w-full" />
                                    </div>
                                </Card>
                            ))
                        ) : quizzes.length > 0 ? (
                            quizzes.map((quiz) => (
                                <Card key={quiz.id}>
                                    <CardHeader>
                                        <CardTitle>{quiz.title}</CardTitle>
                                        <CardDescription>{quiz.subject}</CardDescription>
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
                                <p className="text-muted-foreground text-lg">No quizzes found for your class.</p>
                                <p className="text-muted-foreground text-sm">Try changing your class level or check back later!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
