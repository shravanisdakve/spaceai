import { type LeaderboardEntry } from '../types';
import { auth, db } from '../firebase';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    getDocs,
    query,
    where,
    Timestamp,
    serverTimestamp,
    orderBy,
    limit,
    getDoc
} from 'firebase/firestore';

// --- Session Tracking ---
export const startSession = async (tool: string, courseId: string | null = null): Promise<string | null> => {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;

    try {
        const sessionDocRef = await addDoc(collection(db, 'sessions'), {
            userId,
            tool,
            courseId,
            startTime: serverTimestamp(),
            endTime: null,
            duration: 0
        });
        return sessionDocRef.id;
    } catch (error) {
        console.error("Error starting session in Firestore:", error);
        return null;
    }
};

export const endSession = async (sessionId: string | null) => {
    if (!sessionId) return;
    try {
        const sessionDocRef = doc(db, 'sessions', sessionId);
        const sessionSnap = await import('firebase/firestore').then(mod => mod.getDoc(sessionDocRef)); // Dynamic import to ensure getDoc is available if not imported top-level

        if (sessionSnap.exists()) {
            const data = sessionSnap.data();
            if (data.startTime) {
                const startTime = data.startTime.toDate(); // timestamp to Date
                const endTime = new Date();
                const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

                await updateDoc(sessionDocRef, {
                    endTime: serverTimestamp(),
                    duration: durationSeconds
                });
                console.log(`Session ended. Duration: ${durationSeconds}s`);
            } else {
                await updateDoc(sessionDocRef, {
                    endTime: serverTimestamp(),
                });
            }
        }
    } catch (error) {
        console.error("Error ending session in Firestore:", error);
    }
};

// --- Pomodoro Tracking ---
export const recordPomodoroCycle = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
        await addDoc(collection(db, 'pomodoroCycles'), {
            userId,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error recording pomodoro cycle:", error);
    }
};

// --- Quiz Tracking ---
export const recordQuizResult = async (topic: string, correct: boolean, courseId: string | null = null) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
        await addDoc(collection(db, 'quizResults'), {
            userId,
            topic,
            correct,
            courseId,
            timestamp: serverTimestamp(),
            user: { // Denormalize for easier leaderboard queries later
                email: auth.currentUser?.email,
                displayName: auth.currentUser?.displayName,
            }
        });
    } catch (error) {
        console.error("Error recording quiz result:", error);
    }
};

// --- Data Retrieval for UI ---
export const getProductivityReport = async (courseId: string | null = null) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return {
        totalStudyTime: 0, quizAccuracy: 0, totalQuizzes: 0, correctQuizzes: 0,
        strengths: [], weaknesses: [], completedPomodoros: 0, sessions: []
    };

    const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    // Base queries
    const sessionsQuery = query(collection(db, 'sessions'), where("userId", "==", userId), where("startTime", ">=", oneWeekAgo));
    const quizzesQuery = query(collection(db, 'quizResults'), where("userId", "==", userId), where("timestamp", ">=", oneWeekAgo));
    const pomodorosQuery = query(collection(db, 'pomodoroCycles'), where("userId", "==", userId), where("timestamp", ">=", oneWeekAgo));

    // Course-specific filtering
    const finalSessionsQuery = courseId ? query(sessionsQuery, where("courseId", "==", courseId)) : sessionsQuery;
    const finalQuizzesQuery = courseId ? query(quizzesQuery, where("courseId", "==", courseId)) : quizzesQuery;

    const [sessionSnap, quizSnap, pomodoroSnap] = await Promise.all([
        getDocs(finalSessionsQuery),
        getDocs(finalQuizzesQuery),
        getDocs(pomodorosQuery) // Fixed: Use query not uninitialized snap
    ]);

    const userSessions = sessionSnap.docs.map(doc => {
        const data = doc.data();
        const duration = (data.endTime && data.startTime) ? (data.endTime.toMillis() - data.startTime.toMillis()) / 1000 : 0;
        return { ...data, id: doc.id, duration };
    });

    const userQuizzes = quizSnap.docs.map(doc => doc.data());

    const totalStudyTime = userSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalQuizzes = userQuizzes.length;
    const correctQuizzes = userQuizzes.filter(q => q.correct).length;
    const quizAccuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

    const topicStats: { [topic: string]: { correct: number, total: number } } = {};
    userQuizzes.forEach(quiz => {
        const normalizedTopic = quiz.topic.trim().toLowerCase();
        if (!topicStats[normalizedTopic]) topicStats[normalizedTopic] = { correct: 0, total: 0 };
        topicStats[normalizedTopic].total++;
        if (quiz.correct) topicStats[normalizedTopic].correct++;
    });

    const topicPerformance = Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        count: stats.total,
    }));

    const strengths = topicPerformance.filter(t => t.accuracy >= 80 && t.count > 1).sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
    const weaknesses = topicPerformance.filter(t => t.accuracy < 60 && t.count > 1).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

    return {
        totalStudyTime,
        quizAccuracy,
        totalQuizzes,
        correctQuizzes,
        strengths,
        weaknesses,
        completedPomodoros: pomodoroSnap.docs.length,
        sessions: userSessions,
    };
};

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
    // This is a more complex query and can be expensive. 
    // For a real app, this data would likely be pre-aggregated in a separate collection.
    // Here, we'll do a simplified version that gets a few users.
    console.warn("Leaderboard data is simplified and not optimized for production.");

    const usersQuery = query(collection(db, "quizResults"), limit(50)); // Get last 50 quiz results to find users
    const querySnapshot = await getDocs(usersQuery);

    const userStats: { [userId: string]: { email: string, displayName: string, quizCount: number, correctQuizzes: number } } = {};

    querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!userStats[data.userId]) {
            userStats[data.userId] = {
                email: data.user.email,
                displayName: data.user.displayName,
                quizCount: 0,
                correctQuizzes: 0,
            };
        }
        userStats[data.userId].quizCount++;
        if (data.correct) {
            userStats[data.userId].correctQuizzes++;
        }
    });

    const leaderboard = Object.values(userStats).map(stats => ({
        ...stats,
        studyTime: 0, // Note: Study time is not calculated here for simplicity
        quizScore: stats.quizCount > 0 ? Math.round((stats.correctQuizzes / stats.quizCount) * 100) : 0,
    }));

    return leaderboard.sort((a, b) => b.quizScore - a.quizScore).slice(0, 10);
};

export const getAdaptiveRecommendations = async (userId: string): Promise<import('../types').AdaptiveRecommendation | null> => {
    if (!userId) return null;

    try {
        // Fetch recent quiz results (last 20 for relevance)
        const q = query(
            collection(db, 'quizResults'),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(20)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const topicStats: { [topic: string]: { correct: number, total: number } } = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const topic = data.topic || 'General';
            if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
            topicStats[topic].total++;
            if (data.correct) topicStats[topic].correct++;
        });

        // Calculate accuracy and find the struggle area
        let struggleTopic = '';
        let minAccuracy = 101;

        Object.entries(topicStats).forEach(([topic, stats]) => {
            if (stats.total < 3) return; // Need at least 3 attempts to determine specific struggle
            const accuracy = (stats.correct / stats.total) * 100;
            if (accuracy < minAccuracy) {
                minAccuracy = accuracy;
                struggleTopic = topic;
            }
        });

        if (!struggleTopic) return null; // No clear struggle area found yet

        let severity: 'high' | 'medium' | 'low' = 'low';
        if (minAccuracy < 50) severity = 'high';
        else if (minAccuracy < 75) severity = 'medium';

        let suggestion = "";
        if (severity === 'high') {
            suggestion = `You're having trouble with ${struggleTopic} (${Math.round(minAccuracy)}% accuracy). We recommend reviewing your notes and trying a focused practice session.`;
        } else if (severity === 'medium') {
            suggestion = `Your ${struggleTopic} skills are improving (${Math.round(minAccuracy)}%), but a little more practice could help you master it.`;
        } else {
            return null; // accuracy is high, no recommendation needed
        }

        return {
            topic: struggleTopic,
            accuracy: minAccuracy,
            suggestion,
            severity
        };

    } catch (error) {
        console.error("Error getting adaptive recommendations:", error);
        return null;
    }
};