import React from 'react';
import { Award, Download, Calendar, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '../Common/ui';
import { useToast } from '../../hooks/useToast';

interface Certificate {
    id: string;
    courseName: string;
    instructor: string;
    issueDate: string;
    grade: string;
    skills: string[];
    image: string;
}

const MOCK_CERTIFICATES: Certificate[] = [
    {
        id: 'cert_001',
        courseName: 'Advanced Python for Data Science',
        instructor: 'Dr. Sarah Smith',
        issueDate: '2023-11-15',
        grade: '98%',
        skills: ['Python', 'Pandas', 'NumPy'],
        image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400&h=300'
    },
    {
        id: 'cert_002',
        courseName: 'React.js Fundamentals',
        instructor: 'Mark Johnson',
        issueDate: '2023-10-20',
        grade: '95%',
        skills: ['React', 'Hooks', 'Redux'],
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400&h=300'
    }
];

const CertificatesTab: React.FC = () => {
    const { showToast } = useToast();

    const handleDownload = (certTitle: string) => {
        showToast(`Downloading certificate for ${certTitle}...`, 'success');
        // In a real app, this would trigger a PDF download
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">My Certifications</h2>
                    <p className="text-slate-400">View and download your earned credentials.</p>
                </div>
                <div className="bg-violet-600/10 border border-violet-600/20 px-4 py-2 rounded-lg flex items-center gap-2 text-violet-300">
                    <Award size={20} />
                    <span className="font-bold">{MOCK_CERTIFICATES.length}</span> Earned
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_CERTIFICATES.map((cert) => (
                    <div key={cert.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-violet-500/50 transition-all hover:shadow-xl group relative">
                        {/* Decorative Top Border */}
                        <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500"></div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-slate-700/50 p-3 rounded-full">
                                    <Award className="text-violet-400 w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Issued On</p>
                                    <p className="text-sm text-slate-300 flex items-center justify-end gap-1">
                                        <Calendar size={12} /> {cert.issueDate}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">{cert.courseName}</h3>
                            <p className="text-slate-400 text-sm mb-4">Instructor: {cert.instructor}</p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {cert.skills.map(skill => (
                                    <span key={skill} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-700/50 flex gap-3">
                                <Button
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-none"
                                    onClick={() => handleDownload(cert.courseName)}
                                >
                                    <Download size={16} className="mr-2" /> Download PDF
                                </Button>
                                <Button variant="outline" className="px-3" title="Verify Credential">
                                    <CheckCircle size={18} className="text-green-500" />
                                </Button>
                            </div>
                        </div>

                        {/* Watermark/Select Effect */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-violet-500/20 rounded-xl pointer-events-none transition-colors"></div>
                    </div>
                ))}

                {/* Empty State / Placeholder for Next Certificate */}
                <div className="bg-slate-800/20 border border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mb-4 text-slate-500">
                        <Award size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mb-2">Keep Learning!</h3>
                    <p className="text-slate-500 text-sm max-w-xs mb-6">Complete more courses to earn verified certificates to showcase on your profile.</p>
                    <Button variant="outline" onClick={() => window.location.hash = '#/marketplace'}>
                        Browse Courses
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CertificatesTab;
