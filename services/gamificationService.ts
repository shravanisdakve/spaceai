import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, increment } from 'firebase/firestore';

export interface Badge {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    condition: (stats: UserStats) => boolean;
}

export interface UserStats {
    totalXP: number;
    quizzesTaken: number;
    perfectQuizzes: number;
    studySessions: number; // Pomodoro or others
    studyStreak: number;
    totalStudyTime: number; // in seconds
    socialInvites: number;
}

export interface LevelInfo {
    level: number;
    title: string;
    minXP: number;
    color: string;
}

export const LEVELS: LevelInfo[] = [
    { level: 1, minXP: 0, title: "Novice", color: "#6B7280" },
    { level: 2, minXP: 100, title: "Apprentice", color: "#3B82F6" },
    { level: 3, minXP: 300, title: "Scholar", color: "#8B5CF6" },
    { level: 4, minXP: 700, title: "Master", color: "#F59E0B" },
    { level: 5, minXP: 1500, title: "Legendary", color: "#EC4899" },
];

export const BADGES: Badge[] = [
    {
        id: 'first_step',
        title: 'First Step',
        description: 'Complete your first quiz',
        icon: '🎯',
        xpReward: 10,
        condition: (stats) => stats.quizzesTaken >= 1
    },
    {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Achieve a 7-day study streak',
        icon: '🔥',
        xpReward: 50,
        condition: (stats) => stats.studyStreak >= 7
    },
    {
        id: 'perfect_score',
        title: 'Perfect Score',
        description: 'Get 100% on 3 quizzes',
        icon: '🏆',
        xpReward: 100,
        condition: (stats) => stats.perfectQuizzes >= 3
    },
    {
        id: 'time_management',
        title: 'Time Manager',
        description: 'Complete 10 Study Sessions',
        icon: '⏱️',
        xpReward: 60,
        condition: (stats) => stats.studySessions >= 10
    }
];

export const calculateLevel = (xp: number): LevelInfo => {
    // Find the highest level where xp >= minXP
    return [...LEVELS].reverse().find(l => xp >= l.minXP) || LEVELS[0];
};

export const getProgressToNextLevel = (xp: number): number => {
    const currentLevel = calculateLevel(xp);
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

    if (!nextLevel) return 100; // Max level

    const xpInLevel = xp - currentLevel.minXP;
    const xpNeeded = nextLevel.minXP - currentLevel.minXP;

    return Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));
};

// -- Service Functions --

export const getUserGamification = async (userId: string) => {
    // In a real app, fetch from Firestore 'gamification/{userId}'
    // Mocking for now or using local storage as fallback if offline
    try {
        const docRef = doc(db, 'gamification', userId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return snapshot.data() as UserStats & { badges: string[] };
        } else {
            // Initialize default
            const initialData = {
                totalXP: 0,
                quizzesTaken: 0,
                perfectQuizzes: 0,
                studySessions: 0,
                studyStreak: 1,
                totalStudyTime: 0,
                socialInvites: 0,
                badges: []
            };
            // Try to create it silently
            try { await setDoc(docRef, initialData); } catch (e) { console.warn("Could not init gamification db", e); }
            return initialData;
        }
    } catch (error) {
        console.warn("Gamification offline mode");
        return {
            totalXP: 0, quizzesTaken: 0, perfectQuizzes: 0, studySessions: 0, studyStreak: 0, totalStudyTime: 0, socialInvites: 0, badges: []
        };
    }
};

export const awardXP = async (userId: string, amount: number, action: string) => {
    try {
        const docRef = doc(db, 'gamification', userId);
        await updateDoc(docRef, {
            totalXP: increment(amount)
        });
        return { success: true, newXP: amount };
    } catch (error) {
        console.error("Error awarding XP", error);
        return { success: false };
    }
};

export const checkAndUnlockBadges = async (userId: string, currentStats: UserStats, currentBadges: string[]) => {
    const newBadges: Badge[] = [];

    for (const badge of BADGES) {
        if (!currentBadges.includes(badge.id)) {
            if (badge.condition(currentStats)) {
                newBadges.push(badge);
            }
        }
    }

    if (newBadges.length > 0) {
        try {
            const docRef = doc(db, 'gamification', userId);
            await updateDoc(docRef, {
                badges: arrayUnion(...newBadges.map(b => b.id)),
                totalXP: increment(newBadges.reduce((sum, b) => sum + b.xpReward, 0))
            });
            return newBadges;
        } catch (e) {
            console.error("Error unlocking badges", e);
        }
    }
    return [];
};
