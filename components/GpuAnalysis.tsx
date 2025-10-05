import React from 'react';
import { GpuBenchmarkResult } from '../types';
import { Squares2X2Icon, FireIcon, PuzzlePieceIcon } from '../components/icons';
import GpuVisualizer from './GpuVisualizer';

interface GpuAnalysisProps {
    result: GpuBenchmarkResult;
    theme: 'light' | 'dark';
}

const Thermometer: React.FC<{ temperature: number; tdpLimit: number; label: string }> = ({ temperature, tdpLimit, label }) => {
    const maxHeight = 80; // in px
    const safeZoneHeight = (tdpLimit / 150) * maxHeight;
    const currentHeight = Math.min(maxHeight, (temperature / 150) * maxHeight);
    const isHot = temperature > tdpLimit;

    return (
        <div className="flex flex-col items-center">
            <div className="w-8 h-28 bg-slate-200 dark:bg-slate-700 rounded-full flex items-end relative overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                <div 
                    className="absolute bottom-0 left-0 w-full bg-green-500/30"
                    style={{ height: `${safeZoneHeight}px`}}
                ></div>
                <div 
                    className={`w-full rounded-b-full transition-all duration-500 ease-in-out ${isHot ? 'bg-red-500' : 'bg-purple-500'}`}
                    style={{ height: `${currentHeight}px`}}
                ></div>
                <div 
                    className="absolute left-0 w-full border-t-2 border-dashed border-red-500/80"
                    style={{ bottom: `${safeZoneHeight}px`}}
                >
                     <span className="absolute -right-10 text-xs text-red-500 -translate-y-1/2">{tdpLimit}°C Limit</span>
                </div>
            </div>
             <div className="w-12 h-12 -mt-3 rounded-full flex items-center justify-center text-white font-bold text-base"
                style={{ background: isHot ? '#ef4444' : '#a855f7' }}>
                 {temperature.toFixed(0)}°
            </div>
            <p className="mt-2 font-bold text-sm text-slate-700 dark:text-slate-300">{label}</p>
        </div>
    );
};


const GpuAnalysis: React.FC<GpuAnalysisProps> = ({ result, theme }) => {
    const { 
        config, benchmarkName, theoreticalTFLOPs, kernelExecutionTimeMs, 
        effectiveThroughputGbps, isMemoryBound, peakTemp, avgClockSpeed, 
        throttleTimeMs, estimatedPowerW, computeTimeMs, memoryTimeMs, l2CacheHitRate, thermalData,
        averageCoreUtilization, memoryAccessPattern
    } = result;

    const tempMid = config.ambientTemp + (config.throttleTemp - config.ambientTemp) / 2;

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center space-x-3">
                <div className="bg-purple-500/10 p-2 rounded-md"><Squares2X2Icon className="w-6 h-6 text-purple-500" /></div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">GPU Performance Analysis</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Benchmark: <span className="font-semibold">{benchmarkName}</span>
                        {memoryAccessPattern && <span className="capitalize text-slate-500"> ({memoryAccessPattern} Access)</span>}
                        {config.computationalIntensity && <span className="text-slate-500"> (Intensity: x{config.computationalIntensity.toFixed(1)})</span>}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Key Metrics</h4>
                        <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                             <li className="flex justify-between border-b border-slate-200 dark:border-slate-700 py-2">
                                <span className="font-semibold">Kernel Execution Time:</span>
                                <span className="font-mono">{kernelExecutionTimeMs.toFixed(3)} ms</span>
                            </li>
                             <li className="flex justify-between border-b border-slate-200 dark:border-slate-700 py-2">
                                <span className="font-semibold">Average Core Utilization:</span>
                                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                                    {(averageCoreUtilization * 100).toFixed(1)}%
                                </span>
                            </li>
                             <li className="flex justify-between border-b border-slate-200 dark:border-slate-700 py-2">
                                <span className="font-semibold">Effective Throughput:</span>
                                <span className="font-mono">{effectiveThroughputGbps.toFixed(2)} GB/s</span>
                            </li>
                             <li className="flex justify-between border-b border-slate-200 dark:border-slate-700 py-2">
                                <span className="font-semibold">Average Clock Speed:</span>
                                <span className="font-mono">{avgClockSpeed.toFixed(2)} GHz <span className="text-slate-500 text-xs">/ {config.clockSpeed.toFixed(2)} GHz</span></span>
                            </li>
                            <li className="flex justify-between border-b border-slate-200 dark:border-slate-700 py-2">
                                <span className="font-semibold">Total Throttled Time:</span>
                                <span className={`font-mono font-bold ${throttleTimeMs > 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {throttleTimeMs.toFixed(0)} ms
                                </span>
                            </li>
                            <li className="flex justify-between border-b border-slate-200 dark:border-slate-700 py-2">
                                <span className="font-semibold">Theoretical Peak Performance:</span>
                                <span className="font-mono text-purple-600 dark:text-purple-400">{theoreticalTFLOPs.toFixed(2)} TFLOPs</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                     <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-center">Final Thermal Heatmap</h4>
                      <GpuVisualizer 
                        cores={config.cores} 
                        theme={theme} 
                        temperatures={thermalData}
                        ambientTemp={config.ambientTemp}
                        throttleTemp={config.throttleTemp}
                      />
                      <div className="w-full max-w-xs mt-4">
                          <div className="h-4 w-full rounded-full" style={{ background: 'linear-gradient(to right, hsl(240, 100%, 55%), hsl(180, 100%, 55%), hsl(120, 100%, 55%), hsl(60, 100%, 55%), hsl(0, 100%, 55%))' }}></div>
                          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mt-2">
                              <div className="text-left">
                                  <p className="font-semibold">{config.ambientTemp.toFixed(0)}°C</p>
                                  <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Cool</p>
                              </div>
                              <div className="text-center">
                                  <p className="font-semibold">{tempMid.toFixed(0)}°C</p>
                                  <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Warm</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-semibold">{config.throttleTemp.toFixed(0)}°C</p>
                                  <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Throttle</p>
                              </div>
                          </div>
                      </div>
                </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-cyan-500/10 p-2 rounded-md"><PuzzlePieceIcon className="w-6 h-6 text-cyan-500" /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Bottleneck & L2 Cache Analysis</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                                This chart breaks down the kernel's theoretical time spent on computation versus waiting for memory. The larger bar indicates the primary performance bottleneck.
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        <span>Compute Time</span>
                                        <span>{computeTimeMs.toFixed(2)} ms</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                                        <div className="bg-cyan-500 h-4" style={{ width: `${(computeTimeMs / (computeTimeMs + memoryTimeMs)) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        <span>Memory Wait Time</span>
                                        <span>{memoryTimeMs.toFixed(2)} ms</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                                        <div className="bg-purple-500 h-4" style={{ width: `${(memoryTimeMs / (computeTimeMs + memoryTimeMs)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className={`mt-4 text-center font-semibold text-lg rounded-lg p-3 ${isMemoryBound ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'}`}>
                            Workload is {isMemoryBound ? 'Memory-Bound' : 'Compute-Bound'}
                        </p>
                    </div>
                    
                    <div className="space-y-3 text-sm bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">L2 Cache Hit Rate:</span>
                            <span className="font-mono font-bold text-lg text-purple-600 dark:text-purple-400">{(l2CacheHitRate * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">L2 Cache Size:</span>
                            <span className="font-mono">{config.l2CacheSize.toLocaleString()} KB</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">L2 Cache Latency:</span>
                            <span className="font-mono">{config.l2CacheLatency} cycles</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">L2 Cache Associativity:</span>
                            <span className="font-mono">{config.l2CacheAssociativity}-way</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-amber-500/10 p-2 rounded-md"><FireIcon className="w-6 h-6 text-amber-500" /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Thermal & Throttling Analysis</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-900/50 rounded-md">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Peak Temperature:</span>
                            <span className={`font-mono font-bold ${peakTemp > config.throttleTemp ? 'text-red-500' : 'text-purple-600 dark:text-purple-400'}`}>{peakTemp.toFixed(2)} °C</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-900/50 rounded-md">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Average Power Draw:</span>
                            <span className="font-mono text-purple-600 dark:text-purple-400">{estimatedPowerW.toFixed(2)} W</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-900/50 rounded-md">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Throttling Impact (% of runtime):</span>
                            <span className={`font-mono font-bold ${throttleTimeMs > 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                {kernelExecutionTimeMs > 0 ? ((throttleTimeMs / kernelExecutionTimeMs) * 100).toFixed(1) : '0.0'}%
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Thermometer temperature={peakTemp} tdpLimit={config.throttleTemp} label="Peak Temperature" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GpuAnalysis;