import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, MessageSquare, User } from 'lucide-react';

const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Study', href: '/study-lobby', icon: Users },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'AI Tutor', href: '/tutor', icon: MessageSquare }, // Or 'Social' based on guide, but sticking to core app features
    { name: 'Profile', href: '/profile', icon: User },
];

const BottomNav: React.FC = () => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex justify-around items-center h-16 px-2 z-40 pb-safe">
            {navItems.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
                        }`
                    }
                >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.name}</span>
                </NavLink>
            ))}
        </div>
    );
};

export default BottomNav;
