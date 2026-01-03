import React, { useState } from 'react';
import { Button, Textarea, Input } from '../Common/ui';
import { Lightbulb, CheckCircle, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { FeynmanSessionData } from '../../services/studyTechniques';

interface FeynmanBoardProps {
    onStartSession: (topic: string) => void;
    onSubmitExplanation: (explanation: string) => Promise<any>; // Returns AI analysis
    isAnalyzing: boolean;
}

const FeynmanBoard: React.FC<FeynmanBoardProps> = ({ onStartSession, onSubmitExplanation, isAnalyzing }) => {
    const [step, setStep] = useState<'topic' | 'explain' | 'feedback'>('topic');
    const [topic, setTopic] = useState('');
    const [explanation, setExplanation] = useState('');
    const [feedback, setFeedback] = useState<FeynmanSessionData['feedback'] | null>(null);

    const handleStart = () => {
        if (topic.trim()) {
            onStartSession(topic);
            setStep('explain');
        }
    };

    const handleSubmit = async () => {
        if (explanation.trim()) {
            const result = await onSubmitExplanation(explanation);
            // Mocking feedback structure for now if service doesn't return fit full shape yet
            setFeedback(result || {
                clarity: 4,
                accuracy: 5,
                missingConcepts: ['Concept A', 'Concept B'] // Placeholder
            });
            setStep('feedback');
        }
    };

    const reset = () => {
        setStep('topic');
        setTopic('');
        setExplanation('');
        setFeedback(null);
    }

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Lightbulb size={24} className="text-amber-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Feynman Technique</h2>
                    <p className="text-xs text-slate-400">Master concepts by teaching them simply.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {step === 'topic' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Choose a concept you want to understand better. Imagine you are teaching it to a 12-year-old student.
                        </p>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Concept / Topic</label>
                            <Input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Quantum Entanglement, The Water Cycle..."
                                className="bg-slate-900 border-slate-700"
                            />
                        </div>
                        <Button onClick={handleStart} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                            Start Session <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                )}

                {step === 'explain' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                        <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                            <span className="text-xs text-slate-400 uppercase tracking-widest">Topic</span>
                            <h3 className="text-lg font-semibold text-white">{topic}</h3>
                        </div>
                        <Textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Explain the concept simply here. Avoid jargon..."
                            className="flex-1 bg-slate-900 border-slate-700 p-4 text-slate-200 resize-none"
                        />
                        <Button onClick={handleSubmit} isLoading={isAnalyzing} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Analyze Explanation
                        </Button>
                    </div>
                )}

                {step === 'feedback' && feedback && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-white mb-1">{feedback.clarity}/5</div>
                                <div className="text-xs text-slate-400 uppercase">Clarity Score</div>
                            </div>
                            <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-white mb-1">{feedback.accuracy}/5</div>
                                <div className="text-xs text-slate-400 uppercase">Accuracy Score</div>
                            </div>
                        </div>

                        {feedback.missingConcepts.length > 0 && (
                            <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg">
                                <h4 className="flex items-center gap-2 text-red-300 font-medium mb-3">
                                    <AlertTriangle size={16} /> Identified Gaps
                                </h4>
                                <ul className="space-y-2">
                                    {feedback.missingConcepts.map((gap, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                                            {gap}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-green-900/20 border border-green-900/50 p-4 rounded-lg">
                            <h4 className="flex items-center gap-2 text-green-300 font-medium mb-2">
                                <CheckCircle size={16} /> What you did well
                            </h4>
                            <p className="text-sm text-slate-300">
                                Good job using simple analogies! Your explanation of the core mechanism was solid.
                            </p>
                        </div>

                        <Button onClick={reset} variant="outline" className="w-full">
                            <BookOpen size={16} className="mr-2" /> Start New Topic
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeynmanBoard;
