import GroupList from '../components/Social/GroupList';
import Leaderboard from '../components/Social/Leaderboard';
import { PageHeader } from '../components/Common/ui';
import FriendRequestList from '../components/Social/FriendRequestList';
import FriendsList from '../components/Social/FriendsList';
import { useState } from 'react';
import { Users, User, Trophy } from 'lucide-react';

const Tabs = ({ active, onChange }: any) => (
    <div className="flex gap-4 border-b border-slate-700 mb-6">
        <button
            onClick={() => onChange('friends')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${active === 'friends' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <div className="flex items-center gap-2"><User size={16} /> Friends</div>
        </button>
        <button
            onClick={() => onChange('groups')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${active === 'groups' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <div className="flex items-center gap-2"><Users size={16} /> Study Groups</div>
        </button>
        <button
            onClick={() => onChange('leaderboard')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${active === 'leaderboard' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <div className="flex items-center gap-2"><Trophy size={16} /> Leaderboard</div>
        </button>
    </div>
);

const SocialHub = () => {
    const [activeTab, setActiveTab] = useState('friends');

    return (
        <>
            <div className="max-w-6xl mx-auto space-y-6 pb-12">
                <PageHeader
                    title="Community & Social"
                    subtitle="Connect with peers, join groups, and compete on leaderboards."
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content Areas */}
                    <div className="lg:col-span-8">
                        <Tabs active={activeTab} onChange={setActiveTab} />

                        {/* 1. Friends Tab */}
                        {activeTab === 'friends' && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                <FriendRequestList />
                                <FriendsList />
                            </div>
                        )}

                        {/* 2. Groups Tab */}
                        {
                            activeTab === 'groups' && (
                                <GroupList />
                            )
                        }

                        {/* 3. Leaderboard Tab */}
                        {
                            activeTab === 'leaderboard' && (
                                <Leaderboard />
                            )
                        }
                    </div>

                    {/* Sidebar Stats (Right Column) */}
                    <div className="lg:col-span-4 space-y-6" >
                        <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/40 rounded-xl p-6 ring-1 ring-violet-500/20">
                            <h3 className="text-lg font-bold text-white mb-4">Community Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <p className="text-slate-400 text-xs uppercase font-bold">Friends</p>
                                    <p className="text-2xl font-bold text-white">0</p>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <p className="text-slate-400 text-xs uppercase font-bold">Groups</p>
                                    <p className="text-2xl font-bold text-white">0</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/40 rounded-xl p-6 ring-1 ring-slate-700">
                            <h3 className="text-lg font-bold text-white mb-4">Active Now</h3>
                            <p className="text-sm text-slate-400 italic">No friends online.</p>
                        </div>
                    </div >
                </div >
            </div >
        </>
    );
};

export default SocialHub;
