'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from "@/lib/firebase";
import type { Quiz, UserProfile } from "@/lib/data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calculator, Landmark, FlaskConical, BookText, BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentQuizzesPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                const userDocRef = doc(db, 'users', authUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const profile = userDocSnap.data() as UserProfile;
                    setUserProfile(profile);
                    fetchQuizzes(profile);
                } else {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setUserProfile(null);
                setQuizzes([]);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchQuizzes = async (profile: UserProfile) => {
        if (!profile.school || !profile.class) {
            setLoading(false);
            return;
        }
        try {
            const q = query(
                collection(db, 'quizzes'),
                where('school', '==', profile.school),
                where('class', '==', profile.class)
            );
            const querySnapshot = await getDocs(q);
            const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
            setQuizzes(fetchedQuizzes);
        } catch (error) {
            console.error("Failed to fetch quizzes:", error);
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const getSubjectIcon = (subject: string) => {
        const s = subject.toLowerCase();
        if (s.includes('math')) return <Calculator className="h-6 w-6 text-primary" />;
        if (s.includes('social') || s.includes('history')) return <Landmark className="h-6 w-6 text-primary" />;
        if (s.includes('science') || s.includes('biology') || s.includes('physics') || s.includes('chemistry')) return <FlaskConical className="h-6 w-6 text-primary" />;
        if (s.includes('english')) return <BookText className="h-6 w-6 text-primary" />;
        return <BrainCircuit className="h-6 w-6 text-primary" />;
    };

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
                        {userProfile && (
                            <p className="text-muted-foreground">
                                Showing quizzes for <span className="font-bold text-foreground">Class {userProfile.class}</span> at <span className="font-bold text-foreground">{userProfile.school}</span>
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                     <CardHeader className="p-0">
                                        <div className="bg-muted p-4 flex items-center gap-4">
                                            <Skeleton className="h-14 w-14 rounded-md" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 w-40" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                         <div className="flex justify-between items-center text-sm text-muted-foreground">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                       <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : quizzes.length > 0 ? (
                            quizzes.map((quiz) => {
                                const Icon = getSubjectIcon(quiz.title);
                                return (
                                    <Card key={quiz.id} className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col group">
                                        <CardHeader className="p-0">
                                            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 flex items-center gap-4">
                                                <div className="bg-background p-3 rounded-md shadow-sm">
                                                    {Icon}
                                                </div>
                                                <div>
                                                    <CardTitle className="leading-tight">{quiz.title}</CardTitle>
                                                    <CardDescription>{quiz.class}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 flex flex-col flex-1">
                                             <div className="flex-grow flex justify-between items-center text-sm text-muted-foreground mb-4">
                                                <span>{quiz.questions.length} Questions</span>
                                            </div>
                                            <Button asChild className="w-full mt-auto">
                                                <Link href={`/quiz/${quiz.id}`}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Take Quiz
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground text-lg">No quizzes found for your school and class.</p>
                                <p className="text-muted-foreground text-sm">Please check back later!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
