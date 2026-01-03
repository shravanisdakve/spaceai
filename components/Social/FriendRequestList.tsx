import React, { useEffect, useState } from 'react';
import { getIncomingFriendRequests, respondToFriendRequest, type FriendRequest } from '../../services/socialService';
import { Check, X, UserPlus } from 'lucide-react';
import { Button, Skeleton } from '../Common/ui';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

const FriendRequestList: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRequests = async () => {
        try {
            const list = await getIncomingFriendRequests();
            setRequests(list);
        } catch (error) {
            console.error("Failed to load friend requests", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) loadRequests();
    }, [currentUser]);

    const handleRespond = async (id: string, action: 'accept' | 'reject') => {
        try {
            await respondToFriendRequest(id, action);
            setRequests(prev => prev.filter(r => r.id !== id));
            showToast(action === 'accept' ? "Friend added!" : "Request ignored", "success");
        } catch (error) {
            showToast("Action failed", "error");
        }
    };

    if (isLoading) return <Skeleton className="h-16 w-full" />;

    if (requests.length === 0) return null; // Don't show if empty

    return (
        <div className="bg-slate-800/40 border border-violet-500/20 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-bold text-violet-200 mb-3 flex items-center gap-2">
                <UserPlus size={16} /> Friend Requests ({requests.length})
            </h4>
            <div className="space-y-3">
                {requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                {req.fromUser?.displayName?.[0] || '?'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{req.fromUser?.displayName || 'Unknown User'}</p>
                                <p className="text-xs text-slate-400">Wants to be study buddies</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-500 w-8 h-8 p-0 rounded-full"
                                onClick={() => handleRespond(req.id, 'accept')}
                            >
                                <Check size={14} />
                            </Button>
                            <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-500 w-8 h-8 p-0 rounded-full"
                                onClick={() => handleRespond(req.id, 'reject')}
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FriendRequestList;
