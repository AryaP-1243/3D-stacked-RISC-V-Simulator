import React from 'react';
import { Page } from '../types';
import { LayoutDashboardIcon, WrenchScrewdriverIcon, BeakerIcon, ChartBarIcon, SparklesIcon, Squares2X2Icon, ShieldCheckIcon, DocumentTextIcon } from './icons';

interface HeaderProps {
    activePage: Page;
    currentUser: string | null;
}

const PAGE_DETAILS: { [key in Page]: { title: string; subtitle: string; icon: React.ReactNode } } = {
    dashboard: { title: 'Dashboard', subtitle: 'Welcome to the 3D Simulation Suite', icon: <LayoutDashboardIcon className="w-6 h-6" /> },
    configurator: { title: 'CPU System Configurator', subtitle: 'Define your 2D and 3D RISC-V architectures', icon: <WrenchScrewdriverIcon className="w-6 h-6" /> },
    simulator: { title: 'CPU Benchmark Simulator', subtitle: 'Execute RISC-V code on your defined systems', icon: <BeakerIcon className="w-6 h-6" /> },
    'gpu-simulator': { title: 'GPU Benchmark Simulator', subtitle: 'Simulate throughput-oriented GPU architectures', icon: <Squares2X2Icon className="w-6 h-6" /> },
    analysis: { title: 'Performance Analysis', subtitle: 'Visualize and compare simulation results', icon: <ChartBarIcon className="w-6 h-6" /> },
    'ai-assistant': { title: 'AI Design Assistant', subtitle: 'Get expert advice powered by Gemini', icon: <SparklesIcon className="w-6 h-6" /> },
    'ethics': { title: 'Ethics & AI Bias', subtitle: 'Understanding the implications of AI in chip design', icon: <ShieldCheckIcon className="w-6 h-6" /> },
};

const Header: React.FC<HeaderProps> = ({ activePage, currentUser }) => {
    const details = PAGE_DETAILS[activePage] || PAGE_DETAILS.dashboard;
    const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : '?';

    return (
        <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="text-cyan-600 dark:text-cyan-400">
                            {details.icon}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {details.title}
                            </h1>
                            <h2 className="text-sm text-slate-600 dark:text-slate-300">{details.subtitle}</h2>
                        </div>
                    </div>
                    {currentUser && (
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                                {currentUser}
                            </span>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                {userInitial}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;