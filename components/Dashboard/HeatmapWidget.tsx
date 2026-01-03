import React from 'react';
import { Skeleton } from '../Common/ui';

interface HeatmapData {
    // 0-6 for days (Mon-Sun), 0-2 for time (Morn, Aft, Eve)
    // Value 0-4 for intensity
    [key: string]: number;
}

interface HeatmapWidgetProps {
    data: HeatmapData | null;
    isLoading?: boolean;
}

const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({ data, isLoading }) => {
    if (isLoading) return <Skeleton className="h-64 w-full" />;

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const timeLabels = ['Morning', 'Afternoon', 'Evening'];

    // Helper to get color based on intensity
    const getColor = (intensity: number) => {
        switch (intensity) {
            case 0: return 'bg-slate-800/50';
            case 1: return 'bg-violet-900/40';
            case 2: return 'bg-violet-700/60';
            case 3: return 'bg-violet-600/80';
            case 4: return 'bg-violet-400';
            default: return 'bg-slate-800/50';
        }
    };

    return (
        <div className="bg-slate-800/40 p-6 rounded-xl ring-1 ring-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Study Heat Map
            </h3>

            <div className="flex flex-col gap-2">
                <div className="flex">
                    <div className="w-16"></div> {/* Spacer for time labels */}
                    <div className="flex-1 grid grid-cols-7 gap-1">
                        {dayLabels.map(day => (
                            <div key={day} className="text-xs text-slate-400 text-center">{day}</div>
                        ))}
                    </div>
                </div>

                {timeLabels.map((time, timeIndex) => (
                    <div key={time} className="flex items-center">
                        <div className="w-16 text-xs text-slate-400 font-medium">{time}</div>
                        <div className="flex-1 grid grid-cols-7 gap-1">
                            {dayLabels.map((_, dayIndex) => {
                                // Construct key: "dayIndex-timeIndex"
                                // Mocking logic: dayIndex 0 is Mon. 
                                // In real app, we map Date.getDay() (0=Sun) to our grid.
                                const key = `${dayIndex}-${timeIndex}`;
                                const intensity = data ? (data[key] || 0) : 0;

                                return (
                                    <div
                                        key={key}
                                        className={`h-8 rounded-md transition-all hover:ring-2 hover:ring-violet-300 ${getColor(intensity)}`}
                                        title={`${time} on ${dayLabels[dayIndex]}: ${intensity > 0 ? 'Studied' : 'No activity'}`}
                                    ></div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-400">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-800/50 rounded-sm"></div>
                    <div className="w-3 h-3 bg-violet-900/40 rounded-sm"></div>
                    <div className="w-3 h-3 bg-violet-700/60 rounded-sm"></div>
                    <div className="w-3 h-3 bg-violet-600/80 rounded-sm"></div>
                    <div className="w-3 h-3 bg-violet-400 rounded-sm"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default HeatmapWidget;
