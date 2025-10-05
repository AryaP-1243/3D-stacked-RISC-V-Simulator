import React from 'react';
import { Page } from '../types';
import { 
    CpuChipIcon, LayoutDashboardIcon, WrenchScrewdriverIcon, BeakerIcon, ChartBarIcon, 
    SparklesIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon, 
    ChevronDoubleLeftIcon, ChevronDoubleRightIcon, Squares2X2Icon,
    ShieldCheckIcon, DocumentTextIcon
} from './icons';

interface SidebarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
    onLogout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon className="w-6 h-6" /> },
    { page: 'configurator', label: 'CPU Config', icon: <WrenchScrewdriverIcon className="w-6 h-6" /> },
    { page: 'simulator', label: 'CPU Simulator', icon: <BeakerIcon className="w-6 h-6" /> },
    { page: 'gpu-simulator', label: 'GPU Simulator', icon: <Squares2X2Icon className="w-6 h-6" /> },
    { page: 'analysis', label: 'Analysis', icon: <ChartBarIcon className="w-6 h-6" /> },
    { page: 'ai-assistant', label: 'AI Assistant', icon: <SparklesIcon className="w-6 h-6" /> },
    { page: 'ethics', label: 'Ethics & Bias', icon: <ShieldCheckIcon className="w-6 h-6" /> },
];

const NavLink: React.FC<{
    item: typeof NAV_ITEMS[0];
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}> = ({ item, isActive, isCollapsed, onClick }) => {
    const activeClasses = 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-300';
    const inactiveClasses = 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200';
    
    return (
        <li>
            <button 
                onClick={onClick}
                className={`flex items-center w-full h-12 px-4 rounded-lg transition-all duration-200 group relative ${isActive ? activeClasses : inactiveClasses}`}
            >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-cyan-500 rounded-r-full"></div>}
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>{item.icon}</div>
                <span className={`ml-4 font-semibold text-sm transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{item.label}</span>
                {isCollapsed && (
                    <span className="absolute left-full ml-4 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                        {item.label}
                    </span>
                )}
            </button>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onLogout, theme, toggleTheme, isCollapsed, setIsCollapsed }) => {

    return (
        <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className={`flex items-center h-16 border-b border-slate-200 dark:border-slate-800 px-4 shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                 <div className={`flex items-center space-x-2 overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
                    <CpuChipIcon className="w-8 h-8 text-cyan-500 flex-shrink-0" />
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap">3D Sim Suite</span>
                </div>
                 <div className={`transition-opacity duration-200 ${!isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                     <CpuChipIcon className="w-8 h-8 text-cyan-500"/>
                 </div>
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`absolute -right-4 top-[68px] bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-full p-1.5 text-slate-600 dark:text-slate-400 z-30 transition-transform duration-300 hover:scale-110`}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronDoubleRightIcon className="w-4 h-4" /> : <ChevronDoubleLeftIcon className="w-4 h-4" />}
                </button>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {NAV_ITEMS.map(item => (
                        <NavLink 
                            key={item.page}
                            item={item}
                            isActive={activePage === item.page}
                            isCollapsed={isCollapsed}
                            onClick={() => setActivePage(item.page)}
                        />
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
                    </button>
                    <button
                        onClick={onLogout}
                        className={`flex items-center space-x-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold h-10 rounded-md transition-all duration-200 overflow-hidden ${isCollapsed ? 'w-10 px-2.5' : 'w-auto px-3'}`}
                        aria-label="Logout"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className={`whitespace-nowrap transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;