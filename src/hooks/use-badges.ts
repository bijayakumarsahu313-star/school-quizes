'use client';
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { badgeInfos, type BadgeInfo } from '@/lib/badges';

export function useBadges() {
    const { toast } = useToast();

    const awardBadges = useCallback((score: number, quizSubject: string) => {
        const storedBadges = sessionStorage.getItem('earnedBadges');
        const earnedBadgeIds = storedBadges ? new Set<string>(JSON.parse(storedBadges)) : new Set<string>();
        const newBadges: BadgeInfo[] = [];

        const checkAndAddBadge = (badgeId: string) => {
            if (!earnedBadgeIds.has(badgeId)) {
                const badge = badgeInfos.find(b => b.id === badgeId);
                if (badge) {
                    earnedBadgeIds.add(badgeId);
                    newBadges.push(badge);
                }
            }
        };

        // Badge 1: First Quiz
        checkAndAddBadge("1");

        // Badge 2: Math Whiz
        if (score >= 90 && quizSubject.toLowerCase().includes('math')) {
            checkAndAddBadge("2");
        }

        // Badge 3: Science Star
        if (score >= 90 && (quizSubject.toLowerCase().includes('science') || quizSubject.toLowerCase().includes('biology') || quizSubject.toLowerCase().includes('physics') || quizSubject.toLowerCase().includes('chemistry'))) {
            checkAndAddBadge("3");
        }

        // Badge 5: Perfect Score
        if (score === 100) {
            checkAndAddBadge("5");
        }
        
        // Badge 4: Quiz Master (completed 10 quizzes)
        const completedQuizzes = parseInt(sessionStorage.getItem('completedQuizzes') || '0', 10) + 1;
        sessionStorage.setItem('completedQuizzes', completedQuizzes.toString());
        if (completedQuizzes >= 10) {
            checkAndAddBadge("4");
        }


        if (newBadges.length > 0) {
            sessionStorage.setItem('earnedBadges', JSON.stringify(Array.from(earnedBadgeIds)));
            newBadges.forEach((badge, index) => {
                setTimeout(() => {
                    toast({
                        title: "Badge Earned!",
                        description: `You've earned the "${badge.title}" badge!`,
                    });
                }, index * 1000); // Stagger toasts
            });
        }
    }, [toast]);
    
    return { awardBadges };
}
