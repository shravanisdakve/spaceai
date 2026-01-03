import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { PageHeader, Button, Input, Skeleton } from '../components/Common/ui';
import { useToast } from '../hooks/useToast';
import { MessageSquare, Users, Settings, Send, Hash, FileText } from 'lucide-react';

interface GroupData {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    members: string[];
}

interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: any;
}

const GroupChatTab = ({ groupId }: { groupId: string }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const dummyRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!groupId) return;

        // Listen for messages
        const q = query(
            collection(db, `groups/${groupId}/messages`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
            setMessages(msgs);
            // Scroll to bottom
            setTimeout(() => dummyRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => unsubscribe();
    }, [groupId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        try {
            await addDoc(collection(db, `groups/${groupId}/messages`), {
                text: newMessage,
                senderId: currentUser.uid,
                senderName: currentUser.displayName || 'User',
                timestamp: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 py-20">
                        <MessageSquare className="mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}
                {messages.map(msg => {
                    const isMe = msg.senderId === currentUser?.uid;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                {!isMe && <p className="text-[10px] text-slate-400 mb-1 font-bold">{msg.senderName}</p>}
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={dummyRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-slate-700 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
};

const GroupDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [group, setGroup] = useState<GroupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'resources'>('chat');

    useEffect(() => {
        const fetchGroup = async () => {
            if (!id) return;
            try {
                const docSnap = await getDoc(doc(db, 'groups', id));
                if (docSnap.exists()) {
                    setGroup({ id: docSnap.id, ...docSnap.data() } as GroupData);
                } else {
                    showToast("Group not found", "error");
                    navigate('/social');
                }
            } catch (error) {
                console.error(error);
                showToast("Error loading group", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
    }, [id, navigate, showToast]);

    if (loading) return <Skeleton className="h-screen w-full" />;
    if (!group) return null;

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 cursor-pointer hover:text-white" onClick={() => navigate('/social')}>
                &larr; Back to Groups
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Hash className="text-violet-500" /> {group.name}
                    </h1>
                    <p className="text-slate-400 max-w-2xl">{group.description}</p>
                </div>
                <div className="text-right">
                    <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                        {group.members?.length || 0} Members
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                    <Button
                        variant={activeTab === 'chat' ? 'primary' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('chat')}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                    </Button>
                    <Button
                        variant={activeTab === 'members' ? 'primary' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('members')}
                    >
                        <Users className="mr-2 h-4 w-4" /> Members
                    </Button>
                    <Button
                        variant={activeTab === 'resources' ? 'primary' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('resources')}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Resources
                    </Button>
                </div>

                <div className="md:col-span-3">
                    {activeTab === 'chat' && <GroupChatTab groupId={group.id} />}

                    {activeTab === 'members' && (
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                            <h3 className="text-xl font-bold text-white mb-4">Members List</h3>
                            <p className="text-slate-400">Implementation pending (Phase 3)</p>
                            {/* Would list Members here */}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                            <h3 className="text-xl font-bold text-white mb-4">Shared Resources</h3>
                            <p className="text-slate-400">Start sharing notes and files with your group.</p>
                            {/* Would list uploaded files/notes here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetails;
