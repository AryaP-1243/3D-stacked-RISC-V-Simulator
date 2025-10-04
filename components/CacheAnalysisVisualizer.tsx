
import React from 'react';
import { BenchmarkResult, SystemConfig } from '../types';
import { PuzzlePieceIcon } from './icons';

interface CacheAnalysisVisualizerProps { 
    benchmarkResult: BenchmarkResult, 
    config2D: SystemConfig, 
    config3D: SystemConfig 
}

const CacheAnalysisVisualizer: React.FC<CacheAnalysisVisualizerProps> = ({ benchmarkResult, config2D, config3D }) => {
    
    const configs = {
        '2D Baseline': config2D,
        '3D Stacked': config3D,
    };
    
    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-500/10 p-2 rounded-md"><PuzzlePieceIcon className="w-6 h-6 text-purple-500" /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Cache Hierarchy Analysis</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {(['2D Baseline', '3D Stacked'] as const).map(systemType => (
                    <div key={systemType} className="space-y-4">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">{systemType}</h4>
                        {(['l1', 'l2', 'l3'] as const).map(level => {
                            const cacheConfig = configs[systemType].cache[level];
                            if (!cacheConfig.enabled) {
                                return (
                                    <div key={level} className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{level.toUpperCase()} Cache: <span className="font-normal italic">Disabled</span></p>
                                    </div>
                                );
                            }
                            
                            const data = benchmarkResult[systemType].cache[level];
                            const hitRatePercent = data.hitRate * 100;

                            return (
                                <div key={level} className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{level.toUpperCase()} Cache ({cacheConfig.size}KB, {cacheConfig.associativity}-way)</p>
                                    <div className="w-full bg-red-500/30 dark:bg-red-500/20 rounded-full h-4 overflow-hidden border border-slate-300 dark:border-slate-600">
                                        <div className="bg-cyan-500 h-full rounded-l-full" style={{ width: `${hitRatePercent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1.5 font-mono">
                                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">Hit: {hitRatePercent.toFixed(1)}%</span>
                                        <span className="font-semibold text-red-600 dark:text-red-400">Miss: {(100 - hitRatePercent).toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CacheAnalysisVisualizer;
