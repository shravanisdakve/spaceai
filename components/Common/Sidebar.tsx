import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui';
import ProfileEditModal from '../Modals/ProfileEditModal';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, MessageSquare, FileText, BrainCircuit, LogOut, BarChart2, Users, Edit3, X, ChevronLeft, ChevronRight, BookOpen, Video } from 'lucide-react';

const navigation = [
  { name: 'Study Hub', href: '/', icon: LayoutDashboard },
  { name: 'Insights', href: '/insights', icon: BarChart2 },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'AI Tutor', href: '/tutor', icon: MessageSquare },
  { name: 'Study Room', href: '/study-lobby', icon: Users },
  { name: 'Community', href: '/social', icon: Users },
  { name: 'Marketplace', href: '/marketplace', icon: BookOpen }, // New
  { name: 'Live Sessions', href: '/live-sessions', icon: Video }, // New
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const cacheKey = `avatar-url-${currentUser.uid}`;
      const cachedUrl = sessionStorage.getItem(cacheKey);

      if (cachedUrl && !currentUser.avatar) {
        setAvatarUrl(cachedUrl);
      } else if (currentUser.avatar) {
        setAvatarUrl(currentUser.avatar);
      } else {
        const newUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          currentUser.displayName || 'User'
        )}&background=random&color=fff`;
        sessionStorage.setItem(cacheKey, newUrl);
        setAvatarUrl(newUrl);
      }
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      const cacheKey = `avatar-url-${currentUser?.uid}`;
      sessionStorage.removeItem(cacheKey);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleProfileSave = async (updates: any) => {
    if (!updateUserProfile) throw new Error("Profile update function not loaded.");
    try {
      await updateUserProfile(updates);
      const cacheKey = `avatar-url-${currentUser?.uid}`;
      sessionStorage.removeItem(cacheKey);
      if (updates.avatar) setAvatarUrl(updates.avatar);
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 h-full flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col z-40 transform transition-all duration-300 ease-in-out md:static 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex items-center justify-between p-6">
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg shadow-lg shadow-violet-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold ml-3 bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
                NexusAI
              </h1>
            )}
          </div>
          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center -mr-10 w-6 h-6 bg-slate-800 rounded-full border border-slate-700 text-slate-400 hover:text-white"
            style={{ position: 'absolute', right: '-12px', top: '28px', zIndex: 50 }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          {/* Close (Mobile only) */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 mt-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'mr-3 h-5 w-5'} transition-colors`} />
              {!isCollapsed && <span>{item.name}</span>}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-16 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="p-4 mt-auto">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              {currentUser && (
                <div className="flex items-center space-x-3 mb-4">
                  {avatarUrl && <img src={avatarUrl} alt="User" className="w-10 h-10 rounded-full ring-2 ring-slate-700" />}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm text-white truncate">{currentUser.displayName || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">Free Plan</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">NexusAI v2.0</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="p-4 mt-auto flex justify-center">
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </aside>

      {currentUser && (
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentName={currentUser.displayName || ''}
          onSave={handleProfileSave}
        />
      )}
    </>
  );
};

export default Sidebar;