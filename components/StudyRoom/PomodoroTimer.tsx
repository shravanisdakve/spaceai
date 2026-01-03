import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';
import { Button } from '../Common/ui';

interface PomodoroTimerProps {
    onPhaseChange?: (phase: 'work' | 'shortBreak' | 'longBreak') => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onPhaseChange }) => {
    const WORK_TIME = 25 * 60;
    const SHORT_BREAK = 5 * 60;
    const LONG_BREAK = 15 * 60;

    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [cycles, setCycles] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            handlePhaseComplete();
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const handlePhaseComplete = () => {
        // Play notification sound (optional)
        const audio = new Audio('/notification.mp3'); // Try to play if exists, fail silently
        audio.play().catch(() => { });

        if (phase === 'work') {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles % 4 === 0) {
                setPhase('longBreak');
                setTimeLeft(LONG_BREAK);
                onPhaseChange?.('longBreak');
            } else {
                setPhase('shortBreak');
                setTimeLeft(SHORT_BREAK);
                onPhaseChange?.('shortBreak');
            }
        } else {
            // Break is over, back to work
            setPhase('work');
            setTimeLeft(WORK_TIME);
            onPhaseChange?.('work');
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (phase === 'work') setTimeLeft(WORK_TIME);
        else if (phase === 'shortBreak') setTimeLeft(SHORT_BREAK);
        else setTimeLeft(LONG_BREAK);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const total = phase === 'work' ? WORK_TIME : (phase === 'shortBreak' ? SHORT_BREAK : LONG_BREAK);
        return ((total - timeLeft) / total) * 100;
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span className={phase === 'work' ? 'text-violet-400' : ''}>Work</span>
                    <span>/</span>
                    <span className={phase === 'shortBreak' ? 'text-emerald-400' : ''}>Break</span>
                    <span>/</span>
                    <span className={phase === 'longBreak' ? 'text-blue-400' : ''}>Long Break</span>
                </div>
                <div className="text-xs text-slate-500">Cycle: {cycles % 4}/4</div>
            </div>

            <div className="relative mb-6 flex justify-center">
                {/* Circular Progress (Simple CSS implementation) */}
                <div className="w-48 h-48 rounded-full border-4 border-slate-700 flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                    <div
                        className={`absolute inset-0 rounded-full border-4 ${phase === 'work' ? 'border-violet-500' : 'border-emerald-500'} opacity-100 transition-all duration-1000`}
                        style={{ clipPath: `inset(0 0 ${100 - getProgress()}% 0)` }} // Simple clipping for progress effect
                    ></div>
                    <div className="z-10 text-center">
                        <div className="text-5xl font-mono font-bold text-white tracking-widest">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-sm mt-1 text-slate-400 font-medium uppercase">
                            {phase === 'work' ? 'Focus Time' : 'Take a Break'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button onClick={toggleTimer} variant={isActive ? "secondary" : "primary"} className="w-24">
                    {isActive ? <Pause size={20} /> : <Play size={20} />}
                    {isActive ? "Pause" : "Start"}
                </Button>
                <Button onClick={resetTimer} variant="ghost" className="w-12 px-0">
                    <RotateCcw size={20} />
                </Button>
            </div>

            <div className="mt-4 flex justify-center gap-2">
                <button
                    onClick={() => { setPhase('shortBreak'); setTimeLeft(SHORT_BREAK); setIsActive(false); }}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 text-xs flex flex-col items-center gap-1"
                >
                    <Coffee size={16} /> Short
                </button>
                <button
                    onClick={() => { setPhase('work'); setTimeLeft(WORK_TIME); setIsActive(false); }}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 text-xs flex flex-col items-center gap-1"
                >
                    <Briefcase size={16} /> Work
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
