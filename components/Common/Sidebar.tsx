import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui'; // Only import what's needed for Sidebar directly
import ProfileEditModal from '../Modals/ProfileEditModal'; // Import the extracted modal
import { useAuth } from '../../contexts/AuthContext'; // Adjust path for AuthContext
import { LayoutDashboard, MessageSquare, Share2, FileText, Code, BrainCircuit, LogOut, BarChart2, Users, ClipboardList, Edit3, X } from 'lucide-react';

const navigation = [
  { name: 'Study Hub', href: '/', icon: LayoutDashboard },
  { name: 'Insights', href: '/insights', icon: BarChart2 },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'AI Tutor', href: '/tutor', icon: MessageSquare },
  { name: 'Study Room', href: '/study-lobby', icon: Users },
//   { name: 'Community', href: '/insights?tab=community', icon: Users }, // Assuming Community page removed/merged
];

const Sidebar: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const cacheKey = `avatar-url-${currentUser.uid}`;
      const cachedUrl = sessionStorage.getItem(cacheKey);

      if (cachedUrl) {
        setAvatarUrl(cachedUrl);
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
      // Clear avatar cache on logout
      const cacheKey = `avatar-url-${currentUser?.uid}`;
      sessionStorage.removeItem(cacheKey);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleProfileSave = async (newName: string) => {
    if (!updateUserProfile) {
      throw new Error("Profile update function not loaded.");
    }
    try {
      await updateUserProfile({ displayName: newName });
      // Invalidate avatar cache on name change
      const cacheKey = `avatar-url-${currentUser?.uid}`;
      sessionStorage.removeItem(cacheKey);
      // The useEffect will automatically regenerate the avatar URL
    } catch (error) {
      throw error;
    }
  };
  // --- END FIX ---


  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 flex-shrink-0 bg-slate-800/80 backdrop-blur-lg p-6 flex flex-col ring-1 ring-slate-700 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            <div className="p-2 bg-violet-600 rounded-lg">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold ml-3 bg-gradient-to-r from-violet-400 to-cyan-400 text-transparent bg-clip-text">
              NexusAI
            </h1>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white" aria-label="Close sidebar">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={onClose} // Close sidebar on navigation
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="p-4 rounded-lg bg-slate-800 ring-1 ring-slate-700">
            {currentUser && (
              <div className="flex items-center space-x-3 mb-4">
                {avatarUrl && <img src={avatarUrl} alt="User avatar" className="w-10 h-10 rounded-full" />}
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-sm text-white truncate">{currentUser.displayName || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-slate-400 hover:text-white"
                  onClick={() => setIsProfileModalOpen(true)}
                  title="Edit Profile"
                  aria-label="Edit Profile"
                >
                  <Edit3 size={16} />
                </Button>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-slate-300 hover:bg-red-500/20 hover:text-red-400"
              aria-label="Logout"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">&copy; 2024 NexusAI. All rights reserved.</p>
        </div>
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