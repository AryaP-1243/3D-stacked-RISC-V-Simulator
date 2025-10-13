import React from 'react';
import { CpuChipIcon, WrenchScrewdriverIcon, BeakerIcon, ChartBarIcon, ArrowDownTrayIcon, Squares2X2Icon } from '../components/icons';

interface LandingPageProps {
    onShowLogin: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="text-center p-6 bg-white/5 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-white/10">
        <div className="flex-shrink-0 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 p-4 rounded-full inline-flex mx-auto ring-8 ring-white/5">
            {icon}
        </div>
        <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            <div className="relative isolate px-6 lg:px-8">
                <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#06b6d4] to-[#67e8f9] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                {/* Hero Section */}
                <div className="mx-auto max-w-4xl py-24 sm:py-32">
                    <div className="text-center">
                        <CpuChipIcon className="w-16 h-16 mx-auto mb-6 text-cyan-500 dark:text-cyan-400" />
                        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
                            Simulate the Future of 3D-Stacked Processors
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                           An academic-grade, interactive web application to design, simulate, and quantify the performance, power, and thermal gains of moving from a 2D processor-cache system to a 3D-stacked one using Through-Silicon Vias (TSVs).
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <button
                                onClick={onShowLogin}
                                className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-cyan-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all duration-300 hover:scale-105"
                            >
                                Launch Simulator
                            </button>
                        </div>
                    </div>
                </div>

                {/* "As Featured In" Section */}
                <div className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <h2 className="text-center text-lg font-semibold leading-8 text-slate-800 dark:text-white">
                            A research tool aligned with leading academic and industry standards
                        </h2>
                        <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-4 sm:gap-x-10 lg:mx-0 lg:max-w-none">
                            <p className="text-center text-3xl font-bold text-slate-400 dark:text-slate-500">IEEE</p>
                            <p className="text-center text-3xl font-bold text-slate-400 dark:text-slate-500">ACM</p>
                            <p className="text-center text-3xl font-bold text-slate-400 dark:text-slate-500">ISCA</p>
                            <p className="text-center text-3xl font-bold text-slate-400 dark:text-slate-500">MICRO</p>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mx-auto max-w-6xl py-16">
                    <h2 className="text-center text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-16">
                        An End-to-End Platform for Architectural Exploration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Feature icon={<WrenchScrewdriverIcon className="w-8 h-8" />} title="CPU Config" description="Define parameters for cache, memory, TSVs, and thermal properties for 2D & 3D designs." />
                        <Feature icon={<Squares2X2Icon className="w-8 h-8" />} title="GPU Config" description="Configure a throughput-oriented GPU architecture with detailed thermal and memory settings." />
                        <Feature icon={<BeakerIcon className="w-8 h-8" />} title="Simulate & Run" description="Execute real RISC-V assembly or GPU benchmarks on your virtual architectures." />
                        <Feature icon={<ChartBarIcon className="w-8 h-8" />} title="Analyze & Visualize" description="Visualize the impact of 3D stacking on latency, power, and operating temperature." />
                    </div>
                </div>
                
                 <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#67e8f9] to-[#06b6d4] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;