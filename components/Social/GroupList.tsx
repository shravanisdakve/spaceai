import React, { useState, useEffect } from 'react';
import { getPublicGroups, getUserGroups, joinGroup, leaveGroup, type StudyGroup } from '../../services/groupService';
import { Users, Plus, Search, LogIn, LogOut, Hash } from 'lucide-react';
import { Button, Input, Skeleton } from '../Common/ui';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import CreateGroupModal from './CreateGroupModal';

import { useNavigate } from 'react-router-dom';

const GroupList: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate(); // Hook
    const { showToast } = useToast();

    const [publicGroups, setPublicGroups] = useState<StudyGroup[]>([]);
    const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'my'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadGroupData = async () => {
        setIsLoading(true);
        try {
            const [pub, mine] = await Promise.all([
                getPublicGroups(),
                getUserGroups()
            ]);
            setPublicGroups(pub);
            setMyGroups(mine);
        } catch (error) {
            console.error("Failed to load groups", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) loadGroupData();
    }, [currentUser]);

    const handleJoin = async (id: string) => {
        try {
            await joinGroup(id);
            showToast("Joined group!", "success");
            loadGroupData();
        } catch (error) {
            showToast("Failed to join", "error");
        }
    };

    const handleLeave = async (id: string) => {
        try {
            await leaveGroup(id);
            showToast("Left group", "info");
            loadGroupData();
        } catch (error) {
            showToast("Failed to leave", "error");
        }
    };

    // Filter Logic
    const displayedGroups = filter === 'my' ? myGroups : publicGroups;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        Explore Groups
                    </button>
                    <button
                        onClick={() => setFilter('my')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'my' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        My Groups
                    </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} className="mr-2" /> Create Group
                    </Button>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : displayedGroups.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <Users size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">
                        {filter === 'my' ? "You haven't joined any groups yet." : "No public groups found."}
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                        {filter === 'my' ? "Explore public groups to meet new people or create your own squad." : "Be the first to create one!"}
                    </p>
                    {filter === 'my' && (
                        <Button variant="outline" onClick={() => setFilter('all')}>Explore Groups</Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {displayedGroups.map(group => {
                        const isMember = myGroups.some(g => g.id === group.id);
                        return (
                            <div key={group.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-violet-500/50 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <Hash className="w-24 h-24 text-slate-700/20 -mt-8 -mr-8" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">{group.name}</h3>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Users size={12} /> {group.memberCount || 1} members
                                            </p>
                                        </div>
                                        {isMember ? (
                                            <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/20">Member</span>
                                        ) : (
                                            <span className="bg-slate-700/50 text-slate-400 text-xs px-2 py-1 rounded-full">Public</span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-300 mb-4 line-clamp-2 h-10">{group.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-4 h-6 overflow-hidden">
                                        {group.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">#{tag}</span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        {isMember ? (
                                            <>
                                                <Button
                                                    className="flex-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30"
                                                    onClick={() => navigate(`/group/${group.id}`)}
                                                >
                                                    Open Chat
                                                </Button>
                                                <Button variant="ghost" className="px-3 text-slate-500 hover:text-red-400" onClick={() => handleLeave(group.id)}>
                                                    <LogOut size={16} />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button className="w-full" onClick={() => handleJoin(group.id)}>
                                                <LogIn size={16} className="mr-2" /> Join Group
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadGroupData}
            />
        </div>
    );
};

export default GroupList;
