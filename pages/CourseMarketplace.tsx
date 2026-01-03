import React, { useState } from 'react';
import { PageHeader, Button, Input, Spinner } from '../components/Common/ui';
import { Search, Filter, Star, Users, BookOpen, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // For enrollment
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

// Mock Data for Marketplace
const MARKETPLACE_COURSES = [
    {
        id: 'c_py_ml',
        title: 'Python for Machine Learning',
        instructor: 'Dr. Smith',
        rating: 4.8,
        ratingCount: 234,
        students: 1234,
        category: 'Data Science',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=300&h=200',
        tags: ['Python', 'ML', 'Beginner']
    },
    {
        id: 'c_ds_basics',
        title: 'Data Science Basics',
        instructor: 'Prof. Chen',
        rating: 4.9,
        ratingCount: 512,
        students: 2456,
        category: 'Data Science',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=200',
        tags: ['Data', 'Analysis', 'Statistics']
    },
    {
        id: 'c_web_react',
        title: 'Modern React Development',
        instructor: 'Alex Johnson',
        rating: 4.7,
        ratingCount: 189,
        students: 890,
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=300&h=200',
        tags: ['React', 'Frontend', 'JS']
    },
    {
        id: 'c_ux_design',
        title: 'UX Design Principles',
        instructor: 'Sarah Lee',
        rating: 4.9,
        ratingCount: 320,
        students: 1543,
        category: 'Design',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=300&h=200',
        tags: ['UI/UX', 'Figma', 'Design']
    },
    {
        id: 'c_algo_master',
        title: 'Algorithms Masterclass',
        instructor: 'David Kim',
        rating: 4.6,
        ratingCount: 150,
        students: 670,
        category: 'Computer Science',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=300&h=200',
        tags: ['Algorithms', 'Interviews', 'Java']
    }
];

const CourseMarketplace: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [enrollingId, setEnrollingId] = useState<string | null>(null);

    const filteredCourses = MARKETPLACE_COURSES.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', 'Data Science', 'Web Development', 'Design', 'Computer Science'];

    const handleEnroll = async (courseId: string, courseTitle: string) => {
        if (!currentUser) return;
        setEnrollingId(courseId);

        try {
            // Add to user's courses subcollection
            // In a real app, we'd check if already enrolled first
            await addDoc(collection(db, `users/${currentUser.uid}/courses`), {
                courseId,
                title: courseTitle,
                enrolledAt: serverTimestamp(),
                progress: 0,
                status: 'active'
            });

            showToast(`Enrolled in ${courseTitle}!`, "success");
        } catch (error) {
            console.error("Enrollment failed", error);
            showToast("Failed to enroll. Please try again.", "error");
        } finally {
            setEnrollingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Course Marketplace"
                subtitle="Discover new skills and advance your career with expert-led courses."
            />

            {/* Search & Filter Bar */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search courses, instructors..."
                        className="pl-9 bg-slate-900/50 border-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Filter className="text-slate-400 w-4 h-4 hidden md:block" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                        <div key={course.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-violet-500/50 transition-all hover:shadow-xl hover:-translate-y-1 group">
                            {/* Course Image */}
                            <div className="h-40 bg-slate-700 relative overflow-hidden">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                    {course.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-3">
                                <h3 className="font-bold text-lg text-white leading-tight">{course.title}</h3>
                                <p className="text-sm text-slate-400">By {course.instructor}</p>

                                <div className="flex items-center gap-4 text-xs text-slate-300">
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                        <Star fill="currentColor" size={12} /> {course.rating}
                                        <span className="text-slate-500 font-normal">({course.ratingCount})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users size={12} /> {course.students.toLocaleString()} students
                                    </div>
                                </div>

                                <div className="pt-3 flex gap-2">
                                    <Button
                                        className="w-full bg-violet-600 hover:bg-violet-500"
                                        onClick={() => handleEnroll(course.id, course.title)}
                                        isLoading={enrollingId === course.id}
                                    >
                                        Enroll Now
                                    </Button>
                                    <Button variant="ghost" className="px-3">
                                        <BookOpen size={18} className="text-slate-400" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        No courses found matching your criteria.
                    </div>
                )}
            </div>

            <div className="text-center pt-8">
                <Button variant="outline" className="text-slate-400 border-slate-700 hover:text-white">
                    Show All Courses
                </Button>
            </div>
        </div>
    );
};

export default CourseMarketplace;
