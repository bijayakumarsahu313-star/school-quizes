import React from 'react';
import { Award, Medal, Star, Trophy } from "lucide-react";

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export const badges: Badge[] = [
  {
    id: "1",
    title: "First Quiz",
    description: "Completed your first quiz.",
    icon: <Medal className="h-12 w-12 text-yellow-500" />,
  },
  {
    id: "2",
    title: "Math Whiz",
    description: "Scored 90% or higher on a Math quiz.",
    icon: <Award className="h-12 w-12 text-blue-500" />,
  },
  {
    id: "3",
    title: "Science Star",
    description: "Scored 90% or higher on a Science quiz.",
    icon: <Star className="h-12 w-12 text-green-500" />,
  },
  {
    id: "4",
    title: "Quiz Master",
    description: "Completed 10 quizzes.",
    icon: <Trophy className="h-12 w-12 text-purple-500" />,
  },
  {
    id: "5",
    title: "Perfect Score",
    description: "Achieved a perfect score on any quiz.",
    icon: <Medal className="h-12 w-12 text-red-500" />,
  },
  {
    id: "6",
    title: "Top Performer",
    description: "Ranked #1 in a class quiz.",
    icon: <Trophy className="h-12 w-12 text-orange-500" />,
  },
];
