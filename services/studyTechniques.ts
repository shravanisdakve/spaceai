/**
 * studyTechniques.ts
 * Service file covering logic for Pomodoro, Feynman, and Spaced Repetition
 */

// --- 1. Pomodoro Logic ---
export interface PomodoroConfig {
    workDuration: number; // minutes
    shortBreak: number;
    longBreak: number;
    cyclesBeforeLongBreak: number;
}

export type TimerPhase = 'WORK' | 'BREAK' | 'LONG_BREAK';

export interface PomodoroState {
    phase: TimerPhase;
    timeLeft: number;
    cycleCount: number;
    isRunning: boolean;
}

export const DEFAULT_POMODORO: PomodoroConfig = {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLongBreak: 4
};

// --- 2. Feynman Technique Logic ---
export interface FeynmanSessionData {
    topic: string;
    explanation: string;
    gaps: string[];
    understandingLevel: number; // 1-5
    feedback?: {
        clarity: number;
        accuracy: number;
        missingConcepts: string[];
    }
}

// --- 3. Spaced Repetition Logic (SM-2 Algorithm) ---
export interface Flashcard {
    id: string;
    front: string;
    back: string;
    interval: number; // days
    easeFactor: number; // 1.3 to 2.5 usually
    repetitions: number;
    nextReviewDate: Date;
}

/**
 * Calculates the new state of a flashcard using the SM-2 Algorithm.
 * @param card Current state of the flashcard
 * @param quality User rating 0-5 (0=blackout, 5=perfect)
 */
export const calculateNextReview = (card: Flashcard, quality: number): Flashcard => {
    let { interval, easeFactor, repetitions } = card;

    if (quality >= 3) {
        // Correct response
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
    } else {
        // Incorrect response: Reset interval
        repetitions = 0;
        interval = 1;
    }

    // Update Ease Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3; // Minimum floor

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
        ...card,
        interval,
        easeFactor,
        repetitions,
        nextReviewDate: nextDate
    };
};
