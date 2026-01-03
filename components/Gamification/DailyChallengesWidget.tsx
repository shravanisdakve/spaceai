import React, { useState } from 'react';
import { Target, Zap, Users, CheckCircle } from 'lucide-react';
import { Button, Skeleton } from '../Common/ui';
import { useToast } from '../../hooks/useToast';
import { awardXP } from '../../services/gamificationService';
import { useAuth } from '../../hooks/useAuth';

interface Challenge {
    id: string;
    title: string;
    description: string;
    reward: number;
    progress: number; // 0 to 100
    completed: boolean;
    claimed: boolean;
    icon: any;
}

const DailyChallengesWidget: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Mock Data - In real app, fetch from gamificationService
    const [challenges, setChallenges] = useState<Challenge[]>([
        {
            id: 'c1',
            title: 'Quiz Master',
            description: 'Complete 2 quizzes with 80%+ accuracy',
            reward: 100,
            progress: 50, // 1/2 done
            completed: false,
            claimed: false,
            icon: Target
        },
        {
            id: 'c2',
            title: 'Study Streak',
            description: 'Study for 30 minutes today',
            reward: 50,
            progress: 100,
            completed: true,
            claimed: false,
            icon: Zap
        },
        {
            id: 'c3',
            title: 'Social Learner',
            description: 'Join a study room',
            reward: 75,
            progress: 0,
            completed: false,
            claimed: false,
            icon: Users
        }
    ]);

    const handleClaim = async (challengeId: string, reward: number) => {
        if (!currentUser) return;

        // Optimistic update
        setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, claimed: true } : c));

        try {
            await awardXP(currentUser.uid, reward, 'daily_challenge');
            showToast(`Claimed ${reward} XP!`, "success");
        } catch (error) {
            showToast("Failed to claim reward", "error");
            // Revert if failed
            setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, claimed: false } : c));
        }
    };

    if (loading) return <Skeleton className="h-64 w-full" />;

    return (
        <div className="bg-slate-800/40 p-6 rounded-xl ring-1 ring-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>Today's Challenges</span>
                <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded">Resets in 12h 30m</span>
            </h3>

            <div className="space-y-4">
                {challenges.map(challenge => (
                    <div key={challenge.id} className="relative">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-3">
                                <div className={`p-2 rounded-lg ${challenge.completed ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                    <challenge.icon size={18} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-200 text-sm">{challenge.title}</h4>
                                    <p className="text-xs text-slate-400">{challenge.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-yellow-500">+{challenge.reward} XP</span>
                            </div>
                        </div>

                        {/* Progress or Claim Action */}
                        <div className="pl-12">
                            {challenge.claimed ? (
                                <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                                    <CheckCircle size={14} /> Claimed
                                </div>
                            ) : challenge.completed ? (
                                <Button
                                    size="sm"
                                    className="w-full py-1 h-8 bg-green-600 hover:bg-green-500 text-white text-xs"
                                    onClick={() => handleClaim(challenge.id, challenge.reward)}
                                >
                                    Claim Reward
                                </Button>
                            ) : (
                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 transition-all duration-500"
                                        style={{ width: `${challenge.progress}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyChallengesWidget;
