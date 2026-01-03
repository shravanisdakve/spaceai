import React, { useState } from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';
import { Button, Input } from './ui';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

interface TopBarProps {
    onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="h-16 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left: Search (Desktop) / Menu Toggle (Mobile? - handled by Layout usually) */}
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search courses, notes, rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-inter"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800"></span>
                </button>

                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors">
                    <Settings className="w-5 h-5" />
                </button>

                <div className="h-6 w-px bg-slate-700 mx-1"></div>

                <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-700/50 p-1.5 rounded-full pl-2 transition-colors">
                    <span className="text-sm font-medium text-slate-300 hidden md:block">
                        {currentUser?.displayName?.split(' ')[0] || 'User'}
                    </span>
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-slate-600" />
                    ) : (
                        <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center border border-violet-500 text-white font-bold text-xs">
                            {(currentUser?.displayName?.[0] || 'U').toUpperCase()}
                        </div>
                    )}
                </Link>
            </div>
        </header>
    );
};

export default TopBar;
