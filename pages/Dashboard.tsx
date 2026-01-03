import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Skeleton } from '../components/Common/ui';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { type Course, type Mood as MoodType } from '../types';
import { getMostUsedTool } from '../services/personalizationService';
import { getProductivityReport } from '../services/analyticsService';
import { getCourses, addCourse, deleteCourse } from '../services/courseService';
import GoalsWidget from '../components/Dashboard/GoalsWidget';
import MoodCheckin from '../components/Dashboard/MoodCheckin';
import { getSuggestionForMood } from '../services/geminiService';
import { formatSeconds } from '../utils/formatters';
import {
    MessageSquare, FileText, ArrowRight,
    Target, Zap, BookOpen,
    Trash2, Star, Users,
    BarChart, Clock, Brain, Sparkles, PlusCircle
} from 'lucide-react';
import { getAdaptiveRecommendations } from '../services/analyticsService';
import { type AdaptiveRecommendation } from '../types';

// New Components
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentActivity from '../components/Dashboard/RecentActivity';
import DailyChallengesWidget from '../components/Gamification/DailyChallengesWidget';

// --- SUB COMPONENTS (Kept or Simplified) ---

const ProductivityInsights: React.FC = () => {
    const [report, setReport] = useState<Awaited<ReturnType<typeof getProductivityReport>> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            try {
                const fetchedReport = await getProductivityReport();
                setReport(fetchedReport);
            } catch (error) {
                console.error("Error fetching productivity report:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (isLoading) return <Skeleton className="h-40 w-full" />;

    if (!report) return (
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-slate-700 text-center">
            <p className="text-slate-400">No data available.</p>
        </div>
    );

    const hasData = report.totalStudyTime > 0 || report.totalQuizzes > 0;

    return (
        <div className="bg-slate-800/40 rounded-xl p-6 ring-1 ring-slate-700">
            <h3 className="text-lg font-bold text-slate-100 flex items-center mb-4">
                <BarChart className="w-5 h-5 mr-2 text-violet-400" /> Weekly Snapshot
            </h3>
            {!hasData ? (
                <p className="text-center text-slate-400 py-4 text-sm">Start studying to see data.</p>
            ) : (
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-sky-400" />
                            <span className="font-medium text-slate-300">Time</span>
                        </div>
                        <span className="font-mono text-white font-bold">{formatSeconds(report.totalStudyTime)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <Brain size={16} className="text-rose-400" />
                            <span className="font-medium text-slate-300">Accuracy</span>
                        </div>
                        <span className="font-mono text-white font-bold">{report.quizAccuracy}%</span>
                    </div>
                </div>
            )}
            <Link to="/insights" className="block text-center mt-3 text-xs text-slate-400 hover:text-white transition-colors">
                View Analytics &rarr;
            </Link>
        </div>
    );
};

const MyCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [newCourseName, setNewCourseName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastVisibleDocId, setLastVisibleDocId] = useState<string | null>(null);
    const [hasMoreCourses, setHasMoreCourses] = useState(true);
    const COURSE_LIMIT = 5;
    const { showToast } = useToast();

    const fetchCourses = async (loadMore: boolean = false) => {
        setIsLoading(true);
        try {
            const { courses: newCourses, lastVisibleDocId: newLastVisibleDocId } = await getCourses(loadMore ? lastVisibleDocId : null, COURSE_LIMIT);
            setCourses(prev => loadMore ? [...prev, ...(newCourses || [])] : (newCourses || []));
            setLastVisibleDocId(newLastVisibleDocId);
            setHasMoreCourses((newCourses || []).length === COURSE_LIMIT);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCourseName.trim()) {
            try {
                await addCourse(newCourseName.trim());
                fetchCourses();
                showToast("Course added!", 'success');
                setNewCourseName('');
                setIsAdding(false);
            } catch (error) {
                showToast("Failed to add course.", 'error');
            }
        }
    }

    const handleDeleteCourse = async (id: string) => {
        try {
            await deleteCourse(id);
            fetchCourses();
            showToast("Course deleted.", 'success');
        } catch (error) {
            showToast("Failed to delete course.", 'error');
        }
    }

    return (
        <div className="bg-slate-800/40 rounded-xl p-6 ring-1 ring-slate-700 flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-100 flex items-center mb-4 justify-between">
                <span className="flex items-center"><BookOpen className="w-5 h-5 mr-2 text-violet-400" /> My Courses</span>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{courses?.length || 0}</span>
            </h3>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                {isLoading && <Skeleton className="h-10 w-full" />}
                {!isLoading && (!courses || courses.length === 0) && (
                    <p className="text-slate-500 text-sm text-center py-2">No courses yet.</p>
                )}
                {courses && courses.length > 0 && courses.map(course => (
                    <Link to="/notes" state={{ courseId: course.id }} key={course.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-700">
                        <div className="flex items-center overflow-hidden mr-2">
                            <span className="w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 shadow-sm" style={{ backgroundColor: course.color }}></span>
                            <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">{course.name}</span>
                        </div>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteCourse(course.id); }} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                            <Trash2 size={14} />
                        </button>
                    </Link>
                ))}
            </div>

            {/* Add Button */}
            {isAdding ? (
                <form onSubmit={handleAddCourse} className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-1">
                    <Input
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="Course Name"
                        className="text-xs py-2 h-8"
                        autoFocus
                    />
                    <Button type="submit" className="px-2 py-0 h-8 text-xs">Add</Button>
                    <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-300"><Trash2 size={14} /></button>
                </form>
            ) : (
                <button onClick={() => setIsAdding(true)} className="w-full mt-3 py-2 border border-dashed border-slate-700 text-slate-400 text-xs rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2">
                    <PlusCircle size={14} /> Add New Course
                </button>
            )}
        </div>
    );
}

const tools = [
    { key: 'tutor', name: 'AI Tutor', href: '/tutor', description: 'Practice concepts.', icon: MessageSquare, color: 'text-sky-400', bgColor: 'bg-sky-900/40' },
    { key: 'summaries', name: 'Summaries', href: '/notes', description: 'Generate summaries.', icon: FileText, color: 'text-emerald-400', bgColor: 'bg-emerald-900/40' },
    { key: 'quizzes', name: 'Quizzes', href: '/quizzes', description: 'Test knowledge.', icon: Brain, color: 'text-rose-400', bgColor: 'bg-rose-900/40' },
];

const ToolsList: React.FC = () => (
    <div className="space-y-3">
        {tools.map((tool) => (
            <Link key={tool.key} to={tool.href} className="group flex items-center p-3 bg-slate-800/40 rounded-xl hover:bg-slate-700/60 transition-all duration-300 border border-slate-700/50 hover:border-violet-500/30">
                <div className={`p-2 rounded-lg ${tool.bgColor} mr-3`}>
                    <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white">{tool.name}</h4>
                    <p className="text-xs text-slate-500">{tool.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </Link>
        ))}
    </div>
);

const AdaptiveLearningWidget: React.FC = () => {
    const { currentUser } = useAuth();
    const [recommendation, setRecommendation] = useState<AdaptiveRecommendation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        getAdaptiveRecommendations(currentUser.uid).then(rec => {
            setRecommendation(rec);
            setLoading(false);
        });
    }, [currentUser]);

    if (loading) return <Skeleton className="h-32 w-full" />;
    if (!recommendation) return null;

    return (
        <div className="bg-gradient-to-br from-violet-900/80 to-indigo-900/80 rounded-xl p-5 ring-1 ring-violet-500/40 shadow-lg relative overflow-hidden mb-6 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recommended Focus</h3>
                </div>
                <h4 className="text-lg font-bold text-violet-100 mb-1">{recommendation.topic}</h4>
                <p className="text-sm text-indigo-200 mb-4 line-clamp-2">{recommendation.suggestion}</p>
                <Link to="/quizzes">
                    <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border-0 text-xs">
                        <Target className="w-3 h-3 mr-2" /> Practice Now
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const SESSION_MOOD_CHECKIN_KEY = 'nexusMoodCheckedInSession';

const StudyHub: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [showMoodCheckin, setShowMoodCheckin] = useState(() => {
        try {
            return !sessionStorage.getItem(SESSION_MOOD_CHECKIN_KEY);
        } catch { return true; }
    });
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    const handleMoodSelected = async (mood: string) => {
        setShowMoodCheckin(false);
        try { sessionStorage.setItem(SESSION_MOOD_CHECKIN_KEY, 'true'); } catch { }
        try {
            const suggestion = await getSuggestionForMood(mood);
            setAiSuggestion(suggestion);
        } catch { }
    }

    return (
        <div className="pb-12">
            {/* 1. Header Section */}
            <DashboardHeader />

            {/* 2. Quick Actions */}
            <QuickActions />

            {/* 3. Main Three-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* COLUMN 1: Tools & Study Room (Left) - Span 3 */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 ring-1 ring-slate-700 shadow-md text-center">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                            <Users size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Study Room</h3>
                        <p className="text-xs text-slate-400 mb-4">Join a focused session with peers or AI.</p>
                        <Link to="/study-lobby">
                            <Button className="w-full text-sm">Enter Lobby</Button>
                        </Link>
                    </div>

                    <div className="bg-slate-800/20 rounded-xl p-5 ring-1 ring-slate-800">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">AI Toolkit</h3>
                        <ToolsList />
                    </div>
                </div>

                {/* COLUMN 2: Focus & Recommendations (Center) - Span 6 */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Mood & AI Suggestion */}
                    {showMoodCheckin && <MoodCheckin onMoodSelect={handleMoodSelected} />}
                    {aiSuggestion && (
                        <div className="bg-sky-900/30 border border-sky-500/30 p-4 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                            <Sparkles className="text-sky-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm text-sky-200">AI Tip for You</h4>
                                <p className="text-sm text-sky-100">{aiSuggestion}</p>
                            </div>
                        </div>
                    )}

                    {/* Today's Focus (Goals) */}
                    <div className="bg-slate-800/40 rounded-xl p-6 ring-1 ring-slate-700 min-h-[300px]">
                        <GoalsWidget />
                    </div>

                    {/* Adaptive Learning */}
                    <AdaptiveLearningWidget />
                </div>

                {/* COLUMN 3: Activity & Stats (Right) - Span 3 */}
                <div className="lg:col-span-3 space-y-6">
                    <DailyChallengesWidget />
                    <ProductivityInsights />
                    <RecentActivity />
                    <div className="h-[400px]">
                        <MyCourses />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudyHub;