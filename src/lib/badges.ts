import { Award, Medal, Star, Trophy } from "lucide-react";

export type BadgeInfo = {
  id: string;
  title: string;
  description: string;
  iconName: 'Medal' | 'Award' | 'Star' | 'Trophy';
  iconColor: string;
};

export const badgeInfos: BadgeInfo[] = [
  {
    id: "1",
    title: "First Quiz",
    description: "Completed your first quiz.",
    iconName: 'Medal',
    iconColor: 'text-yellow-500'
  },
  {
    id: "2",
    title: "Math Whiz",
    description: "Scored 90% or higher on a Math quiz.",
    iconName: 'Award',
    iconColor: 'text-blue-500'
  },
  {
    id: "3",
    title: "Science Star",
    description: "Scored 90% or higher on a Science quiz.",
    iconName: 'Star',
    iconColor: 'text-green-500'
  },
  {
    id: "4",
    title: "Quiz Master",
    description: "Completed 10 quizzes.",
    iconName: 'Trophy',
    iconColor: 'text-purple-500'
  },
  {
    id: "5",
    title: "Perfect Score",
    description: "Achieved a perfect score on any quiz.",
    iconName: 'Medal',
    iconColor: 'text-red-500'
  },
  {
    id: "6",
    title: "Top Performer",
    description: "Ranked #1 in a class quiz.",
    iconName: 'Trophy',
    iconColor: 'text-orange-500'
  },
];

export const iconMap = {
    Medal,
    Award,
    Star,
    Trophy,
};
