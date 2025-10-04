import React from 'react';
import { CpuChipIcon, WrenchScrewdriverIcon, BeakerIcon, ChartBarIcon, ArrowDownTrayIcon } from '../components/icons';

interface LandingPageProps {
    onShowLogin: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="text-center">
        <div className="flex-shrink-0 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 p-4 rounded-full inline-flex mx-auto">
            {icon}
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">
            <div className="relative isolate px-6 lg:px-8">
                {/* Hero Section */}
                <div className="mx-auto max-w-4xl py-24 sm:py-32">
                    <div className="text-center">
                        <CpuChipIcon className="w-16 h-16 mx-auto mb-6 text-cyan-500 dark:text-cyan-400" />
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                            A Simulator for 3D-Stacked RISC-V Systems
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                           An academic-grade, interactive web application to design, simulate, and quantify the performance, power, and thermal gains of moving from a 2D processor-cache system to a 3D-stacked one using Through-Silicon Vias (TSVs).
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <button
                                onClick={onShowLogin}
                                className="rounded-md bg-cyan-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-transform duration-200 hover:scale-105"
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
                <div className="mx-auto max-w-5xl py-16">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-12">
                        An End-to-End Platform for Architectural Exploration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                        <Feature icon={<WrenchScrewdriverIcon className="w-8 h-8" />} title="Parametric Configuration" description="Define detailed parameters for cache, memory, TSVs, and thermal properties for both 2D and 3D chip designs." />
                        <Feature icon={<BeakerIcon className="w-8 h-8" />} title="RISC-V Simulation" description="Execute real RISC-V assembly on your virtual architectures to generate cycle-accurate performance data." />
                        <Feature icon={<ChartBarIcon className="w-8 h-8" />} title="Thermoelectric Analysis" description="Instantly visualize the impact of 3D stacking on latency, power consumption, and operating temperature." />
                    </div>
                </div>

                 {/* Publication-Ready Section */}
                <div className="bg-slate-100 dark:bg-slate-900/50 py-24 sm:py-32 rounded-2xl">
                    <div className="mx-auto max-w-5xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl lg:text-center">
                            <h2 className="text-base font-semibold leading-7 text-cyan-600 dark:text-cyan-400">Publication-Ready</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                From Simulation to Publication
                            </p>
                            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                                This tool is designed with academic rigor in mind. All underlying simulation models are formally documented, and results can be exported for reproduction and further analysis.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                             <div className="flex items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                                <ArrowDownTrayIcon className="w-8 h-8 text-cyan-500 mr-4"/>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Export Raw Data</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">Download your complete configuration and results in JSON format for use in other tools and to include with your paper.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;