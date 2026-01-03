import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import TopBar from '../Common/TopBar';
import BottomNav from '../Common/BottomNav';
import Breadcrumbs from '../Common/Breadcrumbs';
import FloatingActionMenu from '../Common/FloatingActionMenu';
import { Button } from '../Common/ui';
import { Menu } from 'lucide-react';

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden font-inter">
            {/* Sidebar (Desktop Collapsible / Mobile Drawer) */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* 
                Top Bar: Contains Search, Notifications, Profile.
                On mobile, we might want to show a Menu button here if Sidebar is hidden 
             */}
                <TopBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 relative scroll-smooth">
                    {/* Breadcrumbs for navigation trail */}
                    <Breadcrumbs />

                    <div className="max-w-7xl mx-auto w-full pb-20 md:pb-0">
                        {/* pb-20 to prevent content being hidden behind mobile bottom nav */}
                        <Outlet />
                    </div>
                </div>

                {/* Mobile Header (Floating Menu Button is mostly enough, but keeping a simple header logic if needed) 
                Actually, TopBar handles the visual header. We need the mobile hamburger trigger if TopBar doesn't have it explicitly enabled 
                OR we overlay it. 
                
                Let's stick to the TopBar having the menu trigger on mobile.
                Correction: TopBar design I made has Search on left. 
                Let's add a mobile-only Menu trigger to TopBar or just overlay it here for simplicity.
            */}
                <div className="md:hidden fixed top-4 left-4 z-50">
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-800/80 backdrop-blur border border-slate-700 shadow-lg text-white">
                        <Menu size={20} />
                    </Button>
                </div>

                {/* Floating Action Button (Quick Actions) */}
                <FloatingActionMenu />

                {/* Bottom Navigation (Mobile Only) */}
                <BottomNav />
            </main>
        </div>
    );
};

export default MainLayout;
