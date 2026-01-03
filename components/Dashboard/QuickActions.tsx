import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, FilePlus, Brain, Users } from 'lucide-react';

const actions = [
    { label: 'Quick Study', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10 hover:bg-yellow-400/20', border: 'border-yellow-400/20', href: '/study-lobby' },
    { label: 'New Note', icon: FilePlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10 hover:bg-emerald-400/20', border: 'border-emerald-400/20', href: '/notes' },
    { label: 'Take Quiz', icon: Brain, color: 'text-rose-400', bg: 'bg-rose-400/10 hover:bg-rose-400/20', border: 'border-rose-400/20', href: '/quizzes' },
    { label: 'Find Friends', icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10 hover:bg-sky-400/20', border: 'border-sky-400/20', href: '/study-lobby' },
];

const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={() => navigate(action.href)}
                    className={`flex items-center p-4 rounded-xl border transition-all duration-300 group ${action.bg} ${action.border}`}
                >
                    <div className={`p-2 rounded-full bg-slate-900/50 mr-3`}>
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="font-semibold text-slate-200 group-hover:text-white">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
