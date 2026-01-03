import React, { useState } from 'react';
import { Button } from '../Common/ui';
import { RefreshCw, Check, X, RotateCcw } from 'lucide-react';
import { Flashcard, calculateNextReview } from '../../services/studyTechniques';

const MOCK_CARDS: Flashcard[] = [
    { id: '1', front: 'What is the powerhouse of the cell?', back: 'Mitochondria', interval: 0, easeFactor: 2.5, repetitions: 0, nextReviewDate: new Date() },
    { id: '2', front: 'What is the chemical symbol for Gold?', back: 'Au', interval: 0, easeFactor: 2.5, repetitions: 0, nextReviewDate: new Date() },
    { id: '3', front: 'Who wrote "1984"?', back: 'George Orwell', interval: 0, easeFactor: 2.5, repetitions: 0, nextReviewDate: new Date() },
];

const StudyFlashcards: React.FC = () => {
    const [cards, setCards] = useState<Flashcard[]>(MOCK_CARDS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    const activeCard = cards[currentIndex];

    const handleRate = (quality: number) => {
        const updatedCard = calculateNextReview(activeCard, quality);

        // Update local state (in a real app, save to DB)
        const newCards = [...cards];
        newCards[currentIndex] = updatedCard; // Update current card statistics
        setCards(newCards);

        // Move to next
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setSessionComplete(true);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        // Reshuffle or reload due cards logic would go here
    };

    if (sessionComplete) {
        return (
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
                <p className="text-slate-400 mb-6">You've reviewed all cards for today.</p>
                <Button onClick={restart} variant="outline">
                    <RotateCcw size={16} className="mr-2" /> Review Again
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full flex flex-col relative max-w-md mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-300">Spaced Repetition Deck</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">
                    {currentIndex + 1} / {cards.length}
                </span>
            </div>

            {/* Card Area */}
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex-1 perspective-1000 cursor-pointer group min-h-[300px] relative"
            >
                <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-slate-700/50 border-2 border-slate-600 rounded-xl flex items-center justify-center p-8 text-center shadow-lg group-hover:border-violet-500/50 transition-colors">
                        <p className="text-xl font-medium text-white select-none">{activeCard.front}</p>
                        <p className="absolute bottom-4 text-xs text-slate-500">Click to flip</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden bg-slate-900 border-2 border-violet-600 rounded-xl flex items-center justify-center p-8 text-center shadow-xl rotate-y-180" style={{ transform: 'rotateY(180deg)' }}>
                        <p className="text-xl font-bold text-violet-100 select-none">{activeCard.back}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className={`mt-6 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <p className="text-center text-xs text-slate-400 mb-2">Rate your recall:</p>
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => handleRate(1)} className="p-2 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 rounded-lg text-red-300 text-xs font-bold transition-colors">
                        Again
                    </button>
                    <button onClick={() => handleRate(3)} className="p-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900/50 rounded-lg text-amber-300 text-xs font-bold transition-colors">
                        Hard
                    </button>
                    <button onClick={() => handleRate(4)} className="p-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-900/50 rounded-lg text-blue-300 text-xs font-bold transition-colors">
                        Good
                    </button>
                    <button onClick={() => handleRate(5)} className="p-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-900/50 rounded-lg text-emerald-300 text-xs font-bold transition-colors">
                        Easy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyFlashcards;
