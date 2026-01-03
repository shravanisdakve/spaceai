import React, { useEffect, useState } from 'react';
import { Trophy, Star, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserGamification, calculateLevel, getProgressToNextLevel, BADGES, type UserStats, type LevelInfo } from '../../services/gamificationService';
import { Skeleton } from '../Common/ui';

const GamificationProfile: React.FC = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<UserStats & { badges: string[] } | null>(null);
    const [level, setLevel] = useState<LevelInfo | null>(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                const data = await getUserGamification(currentUser.uid);
                setStats(data);
                setLevel(calculateLevel(data.totalXP));
                setProgress(getProgressToNextLevel(data.totalXP));
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    if (loading) return <Skeleton className="h-64 w-full" />;
    if (!stats || !level) return null;

    return (
        <div className="bg-slate-800/40 rounded-xl p-6 ring-1 ring-slate-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        {level.title}
                        <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">Lvl {level.level}</span>
                    </h3>
                    <p className="text-slate-400 text-sm">Total XP: <span className="text-white font-mono">{stats.totalXP}</span></p>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4" style={{ borderColor: level.color, backgroundColor: `${level.color}20` }}>
                    {level.level}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Current Level</span>
                    <span>Next Level</span>
                </div>
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Badges Grid */}
            <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" /> Achievements
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {BADGES.map(badge => {
                    const isUnlocked = stats.badges.includes(badge.id);
                    return (
                        <div
                            key={badge.id}
                            className={`p-3 rounded-lg border flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-slate-800/60 border-slate-600 hover:border-violet-500' : 'bg-slate-900/40 border-slate-800 opacity-60'}`}
                            title={badge.description}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${isUnlocked ? 'bg-slate-700' : 'bg-slate-800'}`}>
                                {isUnlocked ? badge.icon : <Lock size={14} className="text-slate-600" />}
                            </div>
                            <span className={`text-xs font-bold ${isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>{badge.title}</span>
                            {isUnlocked && <span className="text-[10px] text-yellow-500 mt-1">+{badge.xpReward} XP</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GamificationProfile;
