import React, { useState, useEffect } from 'react';
import { getGlobalLeaderboard, type LeaderboardEntry } from '../../services/leaderboardService';
import { Trophy, Medal, User as UserIcon } from 'lucide-react';
import { Skeleton } from '../Common/ui';
import { useAuth } from '../../hooks/useAuth';

const Leaderboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'global' | 'friends'>('global');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Currently only implementing Global
                const data = await getGlobalLeaderboard(50);
                setEntries(data);
            } catch (error) {
                console.error("Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [filter]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="text-yellow-400 w-6 h-6" />;
        if (rank === 2) return <Medal className="text-slate-300 w-6 h-6" />;
        if (rank === 3) return <Medal className="text-amber-600 w-6 h-6" />;
        return <span className="font-bold text-slate-500 w-6 text-center">{rank}</span>;
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex bg-slate-800 p-1 rounded-lg mb-6 w-fit">
                <button
                    onClick={() => setFilter('global')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'global' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Global Top 50
                </button>
                <button
                    onClick={() => setFilter('friends')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'friends' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Friends (Coming Soon)
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-6">User</div>
                    <div className="col-span-4 text-right">XP</div>
                </div>

                {loading ? (
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No active players yet. Be the first!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700/50">
                        {entries.map((entry) => {
                            const isMe = entry.userId === currentUser?.uid;
                            return (
                                <div
                                    key={entry.userId}
                                    className={`grid grid-cols-12 items-center p-4 hover:bg-slate-700/30 transition-colors ${isMe ? 'bg-violet-900/10 border-l-2 border-violet-500' : ''}`}
                                >
                                    <div className="col-span-2 flex justify-center">
                                        {getRankIcon(entry.rank || 0)}
                                    </div>
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                            {entry.avatar ? (
                                                <img src={entry.avatar} alt={entry.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={14} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isMe ? 'text-violet-300' : 'text-white'}`}>
                                                {entry.displayName} {isMe && '(You)'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-right font-mono text-violet-400 font-bold">
                                        {entry.xp.toLocaleString()} XP
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
