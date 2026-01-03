import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap: { [key: string]: string } = {
    '': 'Home',
    'insights': 'Insights',
    'notes': 'Notes',
    'tutor': 'AI Tutor',
    'study-lobby': 'Study Room',
    'profile': 'Profile',
    'quizzes': 'Quizzes',
    'terms': 'Terms of Service',
    'privacy': 'Privacy Policy'
};

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav aria-label="Breadcrumb" className="mb-4 hidden md:flex">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                        <Home className="w-4 h-4" />
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const name = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1); // Fallback to capitalized path

                    return (
                        <li key={to} className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-slate-600 mx-1" />
                            {isLast ? (
                                <span className="text-sm font-medium text-violet-400" aria-current="page">
                                    {name}
                                </span>
                            ) : (
                                <Link to={to} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                    {name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
