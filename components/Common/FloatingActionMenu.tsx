import React, { useState } from 'react';
import { Plus, Zap, FilePlus, Brain, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingActionMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        { label: 'Quick Quiz', icon: Brain, color: 'bg-rose-500', onClick: () => navigate('/quizzes') },
        { label: 'New Note', icon: FilePlus, color: 'bg-emerald-500', onClick: () => navigate('/notes') },
        { label: 'Invite Friend', icon: Users, color: 'bg-sky-500', onClick: () => navigate('/profile?tab=social') }, // Assuming profile has invite
        { label: 'Quick Study', icon: Zap, color: 'bg-yellow-500', onClick: () => navigate('/study-lobby') },
    ];

    return (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 flex flex-col items-end space-y-3">
            {/* Actions List */}
            <div className={`transition-all duration-300 flex flex-col items-end space-y-3 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setIsOpen(false);
                            action.onClick();
                        }}
                        className="flex items-center group"
                    >
                        <span className="mr-3 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {action.label}
                        </span>
                        <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform ${action.color}`}>
                            <action.icon size={18} />
                        </div>
                    </button>
                ))}
            </div>

            {/* Main FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-violet-600 to-indigo-600'}`}
                aria-label="Quick Actions"
            >
                {isOpen ? <Plus size={28} /> : <Plus size={28} />}
            </button>
        </div>
    );
};

export default FloatingActionMenu;
