import React, { useState, useEffect } from 'react';
import { Clock, Flame, Trophy, Battery } from 'lucide-react';
import { getProductivityReport } from '../../services/analyticsService';
import { useAuth } from '../../hooks/useAuth';
import { getTimeOfDayGreeting } from '../../services/personalizationService';

const DashboardHeader: React.FC = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalHours: 12.5, // Mock initial
        streak: 7,
        level: 8,
        progress: 82
    });

    useEffect(() => {
        const fetchStats = async () => {
            const report = await getProductivityReport();
            if (report) {
                setStats({
                    totalHours: parseFloat((report.totalStudyTime / 3600).toFixed(1)),
                    streak: report.currentStreak || 5, // Mock streak if missing
                    level: Math.floor(report.totalStudyTime / 3600 / 10) + 1, // Simple level logic
                    progress: Math.min(100, (report.totalStudyTime % 36000) / 360) // Mock progress to next level
                });
            }
        };
        fetchStats();
    }, []);

    const firstName = currentUser?.displayName?.split(' ')[0] || 'User';
    const greeting = getTimeOfDayGreeting();

    return (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 ring-1 ring-slate-700 mb-8 relative overflow-hidden shadow-2xl">

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-600/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">

                {/* Greeting & Progress */}
                <div className="flex-1 w-full md:max-w-xl">
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{firstName}!</span>
                    </h1>
                    <p className="text-slate-400 mb-4">You're making great progress. Keep it up!</p>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-300">Level {stats.level} Progress</span>
                            <span className="text-violet-300">{Math.round(stats.progress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${stats.progress}%` }}
                            >
                                <div className="absolute top-0 right-0 w-full h-full bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-4 sm:gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex-shrink-0 bg-slate-800/60 backdrop-blur-md p-4 rounded-xl ring-1 ring-slate-700/50 min-w-[100px]">
                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <Clock size={16} className="text-sky-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Hours</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalHours}h</p>
                    </div>

                    <div className="flex-shrink-0 bg-slate-800/60 backdrop-blur-md p-4 rounded-xl ring-1 ring-slate-700/50 min-w-[100px]">
                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <Flame size={16} className="text-orange-500" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.streak} <span className="text-sm font-normal text-slate-400">days</span></p>
                    </div>

                    <div className="flex-shrink-0 bg-slate-800/60 backdrop-blur-md p-4 rounded-xl ring-1 ring-slate-700/50 min-w-[100px]">
                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <Trophy size={16} className="text-yellow-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Level</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.level}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHeader;
