
import React from 'react';
import { BenchmarkResult } from '../types';

interface SystemVisualizerProps {
    results: BenchmarkResult | null;
    isVisualizing: boolean;
    theme: 'light' | 'dark';
}

const SystemVisualizer: React.FC<SystemVisualizerProps> = ({ results, isVisualizing, theme }) => {
    const maxDuration = 8.0; // Slowest animation in seconds
    let duration2D = maxDuration;
    let duration3D = 1.5; // A consistently fast baseline for 3D

    // Be extremely defensive with the results data to prevent render crashes.
    if (
        results &&
        results['2D Baseline'] &&
        results['3D Stacked'] &&
        Number.isFinite(results['2D Baseline'].totalCycles) &&
        Number.isFinite(results['3D Stacked'].totalCycles)
    ) {
        const cycles2D = results['2D Baseline'].totalCycles;
        const cycles3D = results['3D Stacked'].totalCycles;

        if (cycles2D > 0 && cycles3D > 0) {
            duration2D = Math.min(maxDuration, duration3D * (cycles2D / cycles3D));
        }
    }

    const strokeColor = theme === 'dark' ? '#475569' : '#cbd5e1';
    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const boxBgColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">System Architecture Visualizer</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* 2D Baseline System */}
                <div className="text-center">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">2D Baseline System</h4>
                    <svg viewBox="0 0 300 100" className="w-full h-auto">
                        <defs>
                            <filter id="glow-2d">
                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* CPU Box */}
                        <rect x="10" y="30" width="80" height="40" rx="5" fill={boxBgColor} stroke={strokeColor} />
                        <text x="50" y="55" textAnchor="middle" fill={textColor} fontSize="12" fontWeight="bold">CPU</text>

                        {/* Memory Box */}
                        <rect x="210" y="30" width="80" height="40" rx="5" fill={boxBgColor} stroke={strokeColor} />
                        <text x="250" y="55" textAnchor="middle" fill={textColor} fontSize="12" fontWeight="bold">Memory</text>

                        {/* Bus */}
                        <line x1="90" y1="50" x2="210" y2="50" stroke={strokeColor} strokeWidth="2" />
                        
                        {/* Data Packet Stream */}
                        <g transform="translate(90, 50)" style={{ filter: 'url(#glow-2d)' }}>
                            {isVisualizing && Array.from({ length: 5 }).map((_, i) => (
                                <circle key={i} r="4" fill="#3b82f6" style={{
                                    animation: `move-2d-stream ${duration2D.toFixed(2)}s linear infinite`,
                                    animationDelay: `${i * (duration2D / 6)}s`
                                }} />
                            ))}
                        </g>
                    </svg>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Long, high-latency bus</p>
                </div>
                {/* 3D Stacked System */}
                <div className="text-center">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">3D Stacked System</h4>
                    <svg viewBox="0 0 150 150" className="w-full h-auto max-w-[150px] mx-auto">
                        <defs>
                            <filter id="glow-3d">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                         {/* Die 1 (Memory) */}
                        <path d="M10 80 L50 110 L140 80 L100 50 Z" fill={boxBgColor} stroke={strokeColor} />
                        <text x="75" y="85" textAnchor="middle" fill={textColor} fontSize="12" fontWeight="bold">Memory Die</text>

                        {/* Die 2 (CPU) */}
                        <path d="M10 30 L50 60 L140 30 L100 0 Z" fill={boxBgColor} stroke={strokeColor} />
                        <text x="75" y="35" textAnchor="middle" fill={textColor} fontSize="12" fontWeight="bold">Logic Die</text>

                        {/* TSVs */}
                        <line x1="60" y1="55" x2="60" y2="75" stroke={strokeColor} strokeWidth="2" />
                        <line x1="75" y1="55" x2="75" y2="75" stroke={strokeColor} strokeWidth="2" />
                        <line x1="90" y1="55" x2="90" y2="75" stroke={strokeColor} strokeWidth="2" />

                        {/* Data Packet Streams for TSVs */}
                        {[60, 75, 90].map((xPos, tsvIndex) => (
                            <g key={tsvIndex} transform={`translate(${xPos}, 55)`} style={{ filter: 'url(#glow-3d)' }}>
                                {isVisualizing && Array.from({ length: 4 }).map((_, i) => (
                                    <circle key={i} r="3" fill="#22d3ee" style={{
                                        animation: `move-3d-stream ${duration3D.toFixed(2)}s linear infinite`,
                                        animationDelay: `${(i * (duration3D / 5)) + (tsvIndex * (duration3D / 15))}s`
                                    }} />
                                ))}
                            </g>
                        ))}
                    </svg>
                     <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Ultra-short, high-bandwidth TSVs</p>
                </div>
            </div>
            {!isVisualizing && (
                <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4 italic">Run a code benchmark to see the animated data flow.</p>
            )}
        </div>
    );
};

export default SystemVisualizer;
