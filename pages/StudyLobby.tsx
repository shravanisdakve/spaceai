import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader, Button, Input, Skeleton } from '../components/Common/ui'; // Import Skeleton
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ArrowRight, PlusCircle, Users } from 'lucide-react';
import CreateRoomModal from '../components/Modals/CreateRoomModal';
import { getRooms } from '../services/communityService';
import { getCourses } from '../services/courseService';
import { type StudyRoom, type Course } from '../types';

const StudyLobby: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [joinId, setJoinId] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    // Data States
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<StudyRoom[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    const location = useLocation();

    const refreshData = async () => { // Extracted for reuse
        setIsLoading(true);
        try {
            const [allRooms, allCourses] = await Promise.all([
                getRooms(),
                getCourses() // Note: Ensure getCourses returns Course[] directly or handle object
            ]);

            // Handle courses potential return format difference (array vs {courses, id})
            const courseList = Array.isArray(allCourses) ? allCourses : (allCourses as any).courses || [];

            setRooms(allRooms);
            setCourses(courseList);

            const topic = location.state?.topic;
            if (topic) {
                const courseIds = courseList.filter((c: Course) => c.name.toLowerCase().includes(topic.toLowerCase())).map((c: Course) => c.id);
                const filtered = allRooms.filter(r => courseIds.includes(r.courseId));
                setFilteredRooms(filtered);
            } else {
                setFilteredRooms(allRooms);
            }
        } catch (error) {
            console.error("Failed to load lobby data", error);
            showToast("Failed to load rooms", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [location.state]);

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinId.trim()) {
            navigate(`/study-room/${joinId.trim()}`);
        }
    };

    const handleCreateRoom = () => {
        setCreateModalOpen(false);
        refreshData(); // Refresh list after creation
    };

    return (
        <>
            <CreateRoomModal isOpen={isCreateModalOpen} onClose={handleCreateRoom} />
            <div className="flex flex-col items-center justify-center min-h-full pb-10">
                <div className="w-full max-w-2xl text-center">
                    <div className="bg-violet-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center ring-1 ring-violet-500/30">
                        <Users size={40} className="text-violet-400" />
                    </div>
                    <PageHeader title="Study Room Lobby" subtitle="Collaborate with friends in real-time video rooms." />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                        {/* Create Room Card */}
                        <div className="bg-slate-800/40 p-6 rounded-2xl ring-1 ring-slate-700 hover:ring-violet-500/50 transition-all flex flex-col items-center text-center shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-2">Create New Room</h3>
                            <p className="text-sm text-slate-400 mb-6 flex-1">Host a private session.</p>
                            <Button onClick={() => setCreateModalOpen(true)} className="w-full py-6 text-base shadow-lg shadow-violet-900/20">
                                <PlusCircle size={20} className="mr-2" /> Create Room
                            </Button>
                        </div>

                        {/* Join Room Card */}
                        <div className="bg-slate-800/40 p-6 rounded-2xl ring-1 ring-slate-700 hover:ring-sky-500/50 transition-all flex flex-col items-center text-center shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-2">Join by ID</h3>
                            <p className="text-sm text-slate-400 mb-6 flex-1">Enter code to join.</p>
                            <form onSubmit={handleJoinRoom} className="w-full flex gap-2">
                                <Input
                                    type="text"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    placeholder="Room ID..."
                                    className="text-center bg-slate-900/50 border-slate-600 focus:ring-sky-500"
                                />
                                <Button type="submit" variant="secondary" className="px-4 bg-slate-700 hover:bg-slate-600 text-white">
                                    <ArrowRight size={20} />
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-16 text-left">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-violet-500 rounded-full inline-block"></span>
                                Public Rooms
                            </h3>
                            <Button variant="ghost" size="sm" onClick={refreshData} disabled={isLoading}>
                                Refresh
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <>
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                </>
                            ) : (
                                <>
                                    {filteredRooms.map(room => (
                                        <div key={room.id} className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-700/40 transition-colors group">
                                            <div className="mb-4 sm:mb-0">
                                                <h4 className="font-bold text-lg text-white group-hover:text-violet-300 transition-colors">{room.name}</h4>
                                                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                                    <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs text-slate-300">
                                                        {courses.find(c => c.id === room.courseId)?.name || 'General'}
                                                    </span>
                                                    {/* Start Time / Status could go here */}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                                    <Users size={14} className="text-sky-400" />
                                                    <span className="font-mono font-bold">{room.users.length}/{room.maxUsers}</span>
                                                </div>
                                                <Button
                                                    onClick={() => navigate(`/study-room/${room.id}`)}
                                                    disabled={room.users.length >= room.maxUsers}
                                                    size="sm"
                                                    className={room.users.length >= room.maxUsers ? 'opacity-50' : 'bg-violet-600 hover:bg-violet-500'}
                                                >
                                                    {room.users.length >= room.maxUsers ? 'Full' : 'Join'} <ArrowRight size={14} className="ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredRooms.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                                            <p className="text-slate-500">No public rooms found.</p>
                                            <Button variant="link" onClick={() => setCreateModalOpen(true)} className="text-violet-400">Create one?</Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudyLobby;