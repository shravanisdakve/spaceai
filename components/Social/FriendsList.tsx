import React, { useState, useEffect } from 'react';
import { getFriends, searchUsers, sendFriendRequest, type FriendProfile } from '../../services/socialService';
import { User as UserIcon, Search, UserPlus, MessageCircle, X } from 'lucide-react';
import { Button, Input, Skeleton } from '../Common/ui'; // Check if Avatar exists or use img
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

const FriendsList: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const loadFriends = async () => {
        try {
            const list = await getFriends();
            setFriends(list);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) loadFriends();
    }, [currentUser]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchUsers(searchTerm);
            // Filter out self and existing friends
            const filtered = results.filter(u =>
                u.uid !== currentUser?.uid &&
                !friends.some(f => f.uid === u.uid)
            );
            setSearchResults(filtered);
            if (filtered.length === 0) showToast("No users found.", "info");
        } catch (error) {
            showToast("Search failed.", "error");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendRequest = async (toId: string) => {
        try {
            await sendFriendRequest(toId);
            showToast("Friend request sent!", "success");
            setSearchResults(prev => prev.filter(u => u.uid !== toId)); // Remove from list
        } catch (error: any) {
            showToast(error.message || "Failed to send request", "error");
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-slate-700 min-h-[400px]">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserIcon /> Your Friends ({friends.length})
            </h3>

            {/* Friend Search Bar */}
            <div className="flex gap-2 mb-6">
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Find friends by email..."
                    className="bg-slate-900 border-slate-700"
                />
                <Button onClick={handleSearch} isLoading={isSearching} disabled={!searchTerm}>
                    <Search size={18} />
                </Button>
            </div>

            {/* Search Results Overlay or List */}
            {searchResults.length > 0 && (
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-slate-300">Search Results</h4>
                        <button onClick={() => setSearchResults([])}><X size={14} className="text-slate-400" /></button>
                    </div>
                    <div className="space-y-2">
                        {searchResults.map(user => (
                            <div key={user.uid} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                                        {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded-full" /> : user.displayName?.[0]}
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">{user.displayName}</span>
                                </div>
                                <Button size="sm" onClick={() => handleSendRequest(user.uid!)}>
                                    <UserPlus size={14} className="mr-1" /> Add
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : friends.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <p>You haven't added any friends yet.</p>
                    <p className="text-sm">Search for study buddies above!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map(friend => (
                        <div key={friend.uid} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-violet-500/50 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold ring-2 ring-slate-800">
                                        {friend.avatar ? <img src={friend.avatar} className="w-full h-full rounded-full object-cover" /> : friend.displayName[0]}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${friend.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{friend.displayName}</h4>
                                    <p className="text-xs text-slate-400">Level {friend.level || 1} • {friend.status || 'Offline'}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MessageCircle size={18} className="text-slate-400 hover:text-white" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendsList;
