import React from 'react';
import { PageHeader, Button } from '../components/Common/ui';
import { Calendar, Video, Users, Clock, ArrowRight } from 'lucide-react';

// Mock Data Structure based on user request
interface LiveSession {
    sessionId: string;
    title: string;
    instructor: string;
    startTime: string; // ISO string for simplicity in mock
    duration: number; // minutes
    capacity: number;
    currentAttendees: number;
    topic: string;
    isLive: boolean;
    image?: string;
}

const LIVE_SESSIONS_DATA: LiveSession[] = [
    {
        sessionId: "live_1",
        title: "Machine Learning Basics",
        instructor: "Dr. Sarah Chen",
        startTime: new Date().toISOString(), // Now
        duration: 60,
        capacity: 100,
        currentAttendees: 87,
        topic: "Introduction to ML",
        isLive: true,
        image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
        sessionId: "live_2",
        title: "Web Development Q&A",
        instructor: "Mark Davis",
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        duration: 45,
        capacity: 50,
        currentAttendees: 12,
        topic: "Frontend Frameworks",
        isLive: false,
        image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
        sessionId: "live_3",
        title: "Data Structures Deep Dive",
        instructor: "Emily Zhang",
        startTime: new Date(Date.now() + 172800000).toISOString(), // 2 days later
        duration: 90,
        capacity: 200,
        currentAttendees: 45,
        topic: "Graph Algorithms",
        isLive: false,
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
        sessionId: "live_4",
        title: "Tech Interview Prep",
        instructor: "CodeMaster Team",
        startTime: new Date(Date.now() + 345600000).toISOString(), // 4 days later
        duration: 60,
        capacity: 500,
        currentAttendees: 120,
        topic: "Career",
        isLive: false,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=250"
    }
];

const LiveSessions: React.FC = () => {
    const liveNow = LIVE_SESSIONS_DATA.filter(s => s.isLive);
    const upcoming = LIVE_SESSIONS_DATA.filter(s => !s.isLive);

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Live Sessions & Webinars"
                subtitle="Join interactive sessions with experts and community members."
            />

            {/* LIVE NOW SECTION */}
            {liveNow.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Happening Now</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {liveNow.map(session => (
                            <div key={session.sessionId} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl shadow-red-900/10 flex flex-col md:flex-row">
                                {/* Thumbnail */}
                                <div className="md:w-2/5 relative">
                                    <img src={session.image} alt={session.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">
                                        <Video size={12} /> LIVE
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6 md:w-3/5 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{session.title}</h3>
                                        <p className="text-slate-400 text-sm mb-4">with <span className="text-white font-medium">{session.instructor}</span></p>

                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Users size={16} className="text-violet-400" />
                                                <span>{session.currentAttendees} / {session.capacity} joined</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Clock size={16} className="text-violet-400" />
                                                <span>Ends in {session.duration} mins</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <Button className="flex-1 bg-red-600 hover:bg-red-500 border-none shadow-lg shadow-red-900/20">
                                            Join Now
                                        </Button>
                                        <Button variant="outline" className="flex-1">
                                            Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* UPCOMING SECTION */}
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming This Week</h2>
                    <button className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1">
                        View Calendar <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcoming.map(session => (
                        <div key={session.sessionId} className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:bg-slate-800 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded">
                                    {new Date(session.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="bg-violet-900/30 text-violet-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Clock size={12} /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">{session.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{session.instructor}</p>

                            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-4 mt-auto">
                                <div>{session.topic}</div>
                                <Button size="sm" variant="secondary" className="h-8">Remind Me</Button>
                            </div>
                        </div>
                    ))}

                    {/* Schedule Your Own Card */}
                    <div className="bg-slate-800/20 rounded-xl border border-dashed border-slate-700 p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/40 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3 group-hover:bg-violet-600 group-hover:text-white transition-colors text-slate-400">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Schedule Session</h3>
                        <p className="text-xs text-slate-500">Host your own webinar</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LiveSessions;
