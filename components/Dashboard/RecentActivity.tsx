import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const activities = [
    { name: 'Java Basics', progress: 50, color: 'from-orange-500 to-red-500', lastStudied: '2 hrs ago' },
    { name: 'Machine Learning', progress: 30, color: 'from-cyan-500 to-blue-500', lastStudied: 'Yesterday' },
    { name: 'Web Development', progress: 70, color: 'from-violet-500 to-fuchsia-500', lastStudied: '3 days ago' },
];

const RecentActivity: React.FC = () => {
    return (
        <div className="bg-slate-800/40 rounded-xl p-6 ring-1 ring-slate-700">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center justify-between">
                <span>Recent Activity</span>
                <Link to="/courses" className="text-xs text-violet-400 hover:text-violet-300 flex items-center">
                    View All <ChevronRight size={14} />
                </Link>
            </h3>

            <div className="space-y-4">
                {activities.map((item, index) => (
                    <div key={index} className="group">
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-slate-200">{item.name}</span>
                            <span className="text-slate-400 text-xs">{item.lastStudied}</span>
                        </div>
                        <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${item.color} w-0 group-hover:w-[${item.progress}%] transition-all duration-1000`}
                                style={{ width: `${item.progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500">{item.progress}% complete</span>
                            <button className="text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">Continue &gt;</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
