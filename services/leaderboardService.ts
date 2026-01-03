import { db, auth } from '../firebase';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    where,
    doc,
    getDoc
} from 'firebase/firestore';
import { socialService } from './socialService'; // Assuming we have getFriends

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    avatar: string;
    xp: number;
    level: number;
    rank?: number;
}

export const getGlobalLeaderboard = async (limitCount = 50): Promise<LeaderboardEntry[]> => {
    try {
        // In a real app with millions of users, we'd use a specific leaderboard collection updated via functions.
        // For MVP/SpaceAI, we query the 'gamification' collection sorted by totalXP.
        // We need to join with 'users' to get display names, or store display names in gamification.
        // For now, let's assume gamification docs might NOT have display names, so we might need to fetch user profiles.
        // Optimization: Store minimal profile in gamification doc or just fetch top 10 profiles.

        const q = query(
            collection(db, 'gamification'),
            orderBy('totalXP', 'desc'),
            limit(limitCount)
        );

        const snap = await getDocs(q);
        const entries: LeaderboardEntry[] = [];

        // Fetch user profiles for the top results parallelly
        const promises = snap.docs.map(async (d, index) => {
            const data = d.data();
            // We need the user profile for name/avatar.
            // Check if it's already in data (if we decided to sync it)
            // If not, fetch from users collection
            let displayName = "Unknown User";
            let avatar = "";

            try {
                const userDoc = await getDoc(doc(db, 'users', d.id));
                if (userDoc.exists()) {
                    const uData = userDoc.data();
                    displayName = uData.displayName || "Anonymous";
                    avatar = uData.avatar || "";
                }
            } catch (e) {
                console.warn("Failed to fetch user profile for leaderboard", d.id);
            }

            return {
                userId: d.id,
                xp: data.totalXP || 0,
                level: 1, // We could calculate this from XP using gamificationService logic
                displayName,
                avatar,
                rank: index + 1
            } as LeaderboardEntry;
        });

        const results = await Promise.all(promises);
        return results.sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));
    } catch (error) {
        console.error("Error fetching global leaderboard", error);
        return [];
    }
};

export const getFriendsLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    // 1. Get current user's friends
    // 2. Fetch their XP
    // 3. Sort

    // Using socialService to get friends IDs
    // Note: socialService.getFriends returns full user profiles. 
    // We can iterate them and fetch their gamification stats.

    // Circular dependency risk if socialService imports this? 
    // socialService is mostly UI facing. Let's assume we can use it or just replicate logic.
    // For simplicity, let's just use the logic here.

    // ... Actually, better to pass the list of friend IDs if possible, but let's try strict fetch.
    return []; // Placeholder for now - logic is complex without pre-fetched friends list
};
