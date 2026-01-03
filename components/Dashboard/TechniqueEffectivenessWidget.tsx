import React from 'react';
import { Skeleton } from '../Common/ui';
import { Star } from 'lucide-react';

interface TechniqueData {
    name: string;
    rating: number; // 0-5
    sessions: number;
}

interface TechniqueEffectivenessWidgetProps {
    data: TechniqueData[];
    isLoading?: boolean;
}

const TechniqueEffectivenessWidget: React.FC<TechniqueEffectivenessWidgetProps> = ({ data, isLoading }) => {
    if (isLoading) return <Skeleton className="h-64 w-full" />;

    return (
        <div className="bg-slate-800/40 p-6 rounded-xl ring-1 ring-slate-700 h-full">
            <h3 className="text-lg font-bold text-white mb-6">Technique Effectiveness</h3>

            <div className="space-y-6">
                {data.map((tech) => (
                    <div key={tech.name}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-200 font-medium">{tech.name}</span>
                            <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                                {tech.rating.toFixed(1)} <Star size={12} fill="currentColor" />
                            </div>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                                style={{ width: `${(tech.rating / 5) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 text-right">{tech.sessions} sessions this month</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechniqueEffectivenessWidget;
