import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Briefcase, Armchair } from 'lucide-react';
import { Button } from '../Common/ui';
import { DEFAULT_POMODORO, TimerPhase } from '../../services/studyTechniques';

interface PomodoroTimerProps {
    onPhaseChange?: (phase: TimerPhase) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onPhaseChange }) => {
    // Convert minutes to seconds for internal state
    const WORK_TIME = DEFAULT_POMODORO.workDuration * 60;
    const SHORT_BREAK = DEFAULT_POMODORO.shortBreak * 60;
    const LONG_BREAK = DEFAULT_POMODORO.longBreak * 60;

    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<TimerPhase>('WORK');
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
        // Play notification sound
        // const audio = new Audio('/sounds/bell.mp3'); 
        // audio.play().catch(() => {});

        if (phase === 'WORK') {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles % DEFAULT_POMODORO.cyclesBeforeLongBreak === 0) {
                setPhase('LONG_BREAK');
                setTimeLeft(LONG_BREAK);
                onPhaseChange?.('LONG_BREAK');
            } else {
                setPhase('BREAK');
                setTimeLeft(SHORT_BREAK);
                onPhaseChange?.('BREAK');
            }
        } else {
            // Break is over, back to work
            setPhase('WORK');
            setTimeLeft(WORK_TIME);
            onPhaseChange?.('WORK');
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (phase === 'WORK') setTimeLeft(WORK_TIME);
        else if (phase === 'BREAK') setTimeLeft(SHORT_BREAK);
        else setTimeLeft(LONG_BREAK);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const total = phase === 'WORK' ? WORK_TIME : (phase === 'BREAK' ? SHORT_BREAK : LONG_BREAK);
        return ((total - timeLeft) / total) * 100;
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span className={phase === 'WORK' ? 'text-violet-400' : ''}>Work</span>
                    <span>/</span>
                    <span className={phase === 'BREAK' ? 'text-emerald-400' : ''}>Short</span>
                    <span>/</span>
                    <span className={phase === 'LONG_BREAK' ? 'text-blue-400' : ''}>Long</span>
                </div>
                <div className="text-xs text-slate-500">Cycle: {cycles % DEFAULT_POMODORO.cyclesBeforeLongBreak}/4</div>
            </div>

            <div className="relative mb-6 flex justify-center">
                {/* Circular Progress (Simple CSS implementation) */}
                <div className="w-48 h-48 rounded-full border-4 border-slate-700 flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                    <div
                        className={`absolute inset-0 rounded-full border-4 ${phase === 'WORK' ? 'border-violet-500' : 'border-emerald-500'} opacity-100 transition-all duration-1000`}
                        style={{ clipPath: `inset(0 0 ${100 - getProgress()}% 0)` }} // Simple clipping for progress effect
                    ></div>
                    <div className="z-10 text-center">
                        <div className="text-5xl font-mono font-bold text-white tracking-widest">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-sm mt-1 text-slate-400 font-medium uppercase">
                            {phase === 'WORK' ? 'Focus Time' : 'Time to Rest'}
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
                    onClick={() => { setPhase('WORK'); setTimeLeft(WORK_TIME); setIsActive(false); }}
                    className={`p-2 rounded-lg hover:bg-slate-700 text-xs flex flex-col items-center gap-1 ${phase === 'WORK' ? 'text-violet-400 bg-slate-700/50' : 'text-slate-400'}`}
                >
                    <Briefcase size={16} /> Work
                </button>
                <button
                    onClick={() => { setPhase('BREAK'); setTimeLeft(SHORT_BREAK); setIsActive(false); }}
                    className={`p-2 rounded-lg hover:bg-slate-700 text-xs flex flex-col items-center gap-1 ${phase === 'BREAK' ? 'text-emerald-400 bg-slate-700/50' : 'text-slate-400'}`}
                >
                    <Coffee size={16} /> Short
                </button>
                <button
                    onClick={() => { setPhase('LONG_BREAK'); setTimeLeft(LONG_BREAK); setIsActive(false); }}
                    className={`p-2 rounded-lg hover:bg-slate-700 text-xs flex flex-col items-center gap-1 ${phase === 'LONG_BREAK' ? 'text-blue-400 bg-slate-700/50' : 'text-slate-400'}`}
                >
                    <Armchair size={16} /> Long
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
