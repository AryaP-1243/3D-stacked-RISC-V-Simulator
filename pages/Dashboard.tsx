import React from 'react';
import { Page, BenchmarkResult, GpuBenchmarkResult } from '../types';
import { WrenchScrewdriverIcon, BeakerIcon, SparklesIcon, ChartBarIcon, RocketLaunchIcon, Squares2X2Icon } from '../components/icons';

interface DashboardProps {
  setActivePage: (page: Page) => void;
  benchmarkResult: BenchmarkResult | null;
  gpuBenchmarkResult: GpuBenchmarkResult | null;
}

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 text-left w-full group relative overflow-hidden"
  >
    <div className="absolute -top-1 -right-1 w-16 h-16 bg-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-cyan-500 dark:text-cyan-400 transition-colors group-hover:bg-cyan-500/10 inline-block">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{description}</p>
    </div>
  </button>
);

const RecentResultCard: React.FC<{
  benchmarkResult: BenchmarkResult | null;
  gpuBenchmarkResult: GpuBenchmarkResult | null;
  onNavigate: () => void;
}> = ({ benchmarkResult, gpuBenchmarkResult, onNavigate }) => (
  <div className="mt-12 animate-fade-in" style={{ animationDelay: '300ms', opacity: 0 }}>
    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Recent Simulation Results</h2>
    <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benchmarkResult && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <RocketLaunchIcon className="w-5 h-5 text-green-500" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">CPU Performance Gain</h4>
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                +{benchmarkResult.improvement.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reduction in execution cycles (3D vs 2D)</p>
            </div>
          )}
          {gpuBenchmarkResult && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Squares2X2Icon className="w-5 h-5 text-purple-500" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">GPU Kernel Time</h4>
              </div>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {gpuBenchmarkResult.kernelExecutionTimeMs.toFixed(2)} ms
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total time for "{gpuBenchmarkResult.benchmarkName}"</p>
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-slate-600 dark:text-slate-300 mb-4">Your latest simulation data is ready for review.</p>
          <button
            onClick={onNavigate}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Jump to Analysis</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ setActivePage, benchmarkResult, gpuBenchmarkResult }) => {
  const hasResults = benchmarkResult || gpuBenchmarkResult;

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">Welcome to the 3D-Stacked RISC-V Simulator</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-3xl">
            An interactive suite to design, simulate, and quantify the performance gains of 3D-stacked processors. Get started by configuring your system or jumping straight into a benchmark simulation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '150ms', opacity: 0 }}>
          <FeatureCard
            title="System Configurator"
            description="Define parameters for cache, memory, and TSVs for 2D and 3D architectures."
            icon={<WrenchScrewdriverIcon className="w-8 h-8"/>}
            onClick={() => setActivePage('configurator')}
          />
          <FeatureCard
            title="Benchmark Simulator"
            description="Write or load RISC-V code and run it on your custom-defined systems."
            icon={<BeakerIcon className="w-8 h-8"/>}
            onClick={() => setActivePage('simulator')}
          />
          <FeatureCard
            title="AI Design Assistant"
            description="Get expert advice on chip design, code, and optimization powered by Gemini."
            icon={<SparklesIcon className="w-8 h-8"/>}
            onClick={() => setActivePage('ai-assistant')}
          />
        </div>

        {hasResults && (
          <RecentResultCard 
            benchmarkResult={benchmarkResult}
            gpuBenchmarkResult={gpuBenchmarkResult}
            onNavigate={() => setActivePage('analysis')}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;