

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { BenchmarkResult, RegisterFile, GpuBenchmarkResult, BenchmarkMetrics, SystemConfig, HardwareValidationResult } from '../types';
import SystemVisualizer from '../components/SystemVisualizer';
import GpuAnalysis from '../components/GpuAnalysis';
import RegisterDisplay from '../components/RegisterDisplay';
import { ChartBarIcon, FireIcon, ArrowDownTrayIcon, LightBulbIcon, RocketLaunchIcon, ChevronDownIcon, SparklesIcon, ExclamationTriangleIcon, PuzzlePieceIcon } from '../components/icons';
import CacheAnalysisVisualizer from '../components/CacheAnalysisVisualizer';

interface AnalysisProps {
    benchmarkResult: BenchmarkResult | null;
    registerFile: RegisterFile | null;
    gpuBenchmarkResult: GpuBenchmarkResult | null;
    theme: 'light' | 'dark';
    config2D: SystemConfig;
    config3D: SystemConfig;
}

type ChartMetric = 'totalCycles' | 'amat' | 'ipc' | 'operatingTemp';

const METRIC_DETAILS: { [key in ChartMetric]: { label: string; unit: string } } = {
    totalCycles: { label: 'Total Cycles', unit: '' },
    amat: { label: 'AMAT', unit: 'Cycles' },
    ipc: { label: 'IPC', unit: '' },
    operatingTemp: { label: 'Operating Temp', unit: '°C' }
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; description: string; valueColor: string; }> = ({ icon, title, value, description, valueColor }) => (
    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 h-full">
        <div className="flex items-center space-x-3">
            <div className="bg-slate-200 dark:bg-slate-700/50 p-2 rounded-md">{icon}</div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p>
        </div>
        <p className={`mt-3 text-3xl font-bold ${valueColor}`}>{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
);

const Thermometer: React.FC<{ temperature: number; tdpLimit: number; label: string }> = ({ temperature, tdpLimit, label }) => {
    const maxHeight = 120; // in px
    const safeZoneHeight = (tdpLimit / 150) * maxHeight;
    const currentHeight = Math.min(maxHeight, (temperature / 150) * maxHeight);
    const isHot = temperature > tdpLimit;

    return (
        <div className="flex flex-col items-center">
            <div className="w-10 h-40 bg-slate-200 dark:bg-slate-700 rounded-full flex items-end relative overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                <div 
                    className="absolute bottom-0 left-0 w-full bg-green-500/30"
                    style={{ height: `${safeZoneHeight}px`}}
                ></div>
                <div 
                    className={`w-full rounded-b-full transition-all duration-500 ease-in-out ${isHot ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ height: `${currentHeight}px`}}
                ></div>
                <div 
                    className="absolute left-0 w-full border-t-2 border-dashed border-red-500/80"
                    style={{ bottom: `${safeZoneHeight}px`}}
                >
                     <span className="absolute -right-10 text-xs text-red-500 -translate-y-1/2">{tdpLimit}°C Limit</span>
                </div>
            </div>
             <div className="w-16 h-16 -mt-4 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ background: isHot ? '#ef4444' : '#06b6d4' }}>
                 {temperature.toFixed(1)}°
            </div>
            <p className="mt-2 font-bold text-sm text-slate-700 dark:text-slate-300">{label}</p>
        </div>
    );
};

const AiInsights: React.FC<{ insights: string }> = ({ insights }) => (
    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0">
        {insights.split('\n').map((paragraph, index) => {
            if (paragraph.startsWith('* ')) {
                return <p key={index} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-cyan-500">{paragraph.substring(2)}</p>;
            }
            if (paragraph.includes('**')) {
                const parts = paragraph.split('**');
                return <p key={index}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-800 dark:text-slate-100">{part}</strong> : part)}</p>;
            }
            return <p key={index}>{paragraph}</p>;
        })}
    </div>
);



const Analysis: React.FC<AnalysisProps> = ({ benchmarkResult: initialResult, registerFile, gpuBenchmarkResult, theme, config2D, config3D }) => {
    const [activeMetric, setActiveMetric] = useState<ChartMetric>('totalCycles');
    const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(initialResult);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [isPredicting, setIsPredicting] = useState<boolean>(false);
    const [predictionError, setPredictionError] = useState<string | null>(null);

    React.useEffect(() => {
        setBenchmarkResult(initialResult);
         // When new results arrive, clear old validation/prediction data
        if (initialResult) {
            const newResult = { ...initialResult };
            delete newResult.validation;
            setBenchmarkResult(newResult);
        }
    }, [initialResult]);

    const generateAiInsights = async () => {
        if (!benchmarkResult && !gpuBenchmarkResult) return;
        setIsAiLoading(true);
        setAiError(null);
        setAiInsights(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const context = `
                You are a world-class computer architect analyzing simulation results. Provide a concise, expert analysis of the following data.
                Your response MUST BE formatted with markdown-style bolding for headings (e.g., "**Summary:**") and use asterisks for bullet points (e.g., "* Suggestion: ...").
                The analysis should contain three sections: 1. A brief executive summary. 2. Identification of the primary performance bottleneck. 3. One or two specific, actionable recommendations for configuration changes to improve performance.
                Be direct and focus on the most important takeaways.

                When GPU results are present, provide a specific analysis for them:
                1.  **Bottleneck Analysis:** State clearly whether the workload is memory-bound or compute-bound, and why.
                2.  **L2 Cache Performance:** Comment on the L2 hit rate. If it's low for the workload type, suggest increasing its size.
                3.  **Thermal Impact:** Note the percentage of time spent throttling and its effect on average clock speed. Recommend specific changes to thermal resistance or power draw to mitigate this.

                ${benchmarkResult ? `
                CPU 2D Baseline Config: ${JSON.stringify(config2D, null, 2)}
                CPU 3D Stacked Config: ${JSON.stringify(config3D, null, 2)}
                CPU Simulation Results: ${JSON.stringify(benchmarkResult, null, 2)}
                ` : ''}
                
                ${gpuBenchmarkResult ? `
                GPU Config: ${JSON.stringify(gpuBenchmarkResult.config, null, 2)}
                GPU Simulation Results: ${JSON.stringify(gpuBenchmarkResult, null, 2)}
                ` : ''}
                ---
                Please generate the analysis based on the provided data.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: context
            });
            setAiInsights(response.text);
        } catch (e: any) {
            console.error(e);
            setAiError('Failed to generate AI insights. Please ensure your API key is configured correctly in the environment.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handlePredictHardware = async () => {
        if (!benchmarkResult) return;
        setIsPredicting(true);
        setPredictionError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                You are a hardware modeling expert. Based on the provided CPU simulation results and configurations, predict the performance on real-world FPGA hardware (specifically a PYNQ-Z2 board).
                
                Consider the "reality gap": real hardware has overheads not perfectly captured in this high-level simulation, such as OS jitter, DDR memory controller contention, and more complex physical thermal properties.
                
                The 2D system uses off-chip DDR RAM. The 3D system uses on-chip BRAM to emulate the low latency of a stacked memory die.
                
                Your task is to predict the 'totalCycles' and 'operatingTemp' for both the '2D Baseline' and '3D Stacked' configurations.
                
                Return ONLY the JSON object. Do not add any conversational text or markdown formatting.

                2D Baseline Config: ${JSON.stringify(config2D)}
                3D Stacked Config: ${JSON.stringify(config3D)}
                Simulation Results: ${JSON.stringify(benchmarkResult)}
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    '2D Baseline': {
                        type: Type.OBJECT,
                        properties: {
                            totalCycles: { type: Type.INTEGER, description: 'Predicted total clock cycles for the 2D system on hardware.' },
                            operatingTemp: { type: Type.NUMBER, description: 'Predicted operating temperature in Celsius for the 2D system on hardware.' }
                        },
                        required: ['totalCycles', 'operatingTemp']
                    },
                    '3D Stacked': {
                        type: Type.OBJECT,
                        properties: {
                            totalCycles: { type: Type.INTEGER, description: 'Predicted total clock cycles for the 3D system on hardware.' },
                            operatingTemp: { type: Type.NUMBER, description: 'Predicted operating temperature in Celsius for the 3D system on hardware.' }
                        },
                        required: ['totalCycles', 'operatingTemp']
                    }
                },
                required: ['2D Baseline', '3D Stacked']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema
                }
            });

            const validationData = JSON.parse(response.text) as HardwareValidationResult;
            setBenchmarkResult(prev => prev ? { ...prev, validation: validationData } : null);

        } catch (e: any) {
            console.error("AI Prediction Error:", e);
            setPredictionError("Failed to predict hardware results. The model may have returned an invalid format or an error occurred.");
        } finally {
            setIsPredicting(false);
        }
    };

    useEffect(() => {
        // Automatically trigger AI analysis when results are available for the first time
        if ((benchmarkResult || gpuBenchmarkResult) && !aiInsights && !isAiLoading && !aiError) {
            generateAiInsights();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [benchmarkResult, gpuBenchmarkResult]);


    const exportToJson = () => {
        const data = {
            simulationTimestamp: new Date().toISOString(),
            cpuConfiguration: {
                '2D Baseline': config2D,
                '3D Stacked': config3D,
            },
            cpuBenchmarkResult: benchmarkResult,
            gpuBenchmarkResult: gpuBenchmarkResult,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `simulation-results-${new Date().getTime()}.json`;
        link.click();
    };

    const { chartData, yAxisDomain } = useMemo(() => {
        if (!benchmarkResult) return { chartData: [], yAxisDomain: [0, 10] as [number, number] };
        const getValue = (metric: ChartMetric) => ({
            '2D': benchmarkResult['2D Baseline'][metric],
            '3D': benchmarkResult['3D Stacked'][metric],
        });
        const values = getValue(activeMetric);
        const cleanValue2D = Number.isFinite(values['2D']) ? values['2D'] : 0;
        const cleanValue3D = Number.isFinite(values['3D']) ? values['3D'] : 0;
        const data = [ { name: '2D Baseline', value: cleanValue2D }, { name: '3D Stacked', value: cleanValue3D } ];
        const dataMax = Math.max(cleanValue2D, cleanValue3D);
        let domainMin = 0, domainMax = dataMax > 0 ? Math.ceil(dataMax * 1.1) : 10;
        if(activeMetric === 'operatingTemp') { domainMin = 20; domainMax = Math.max(100, Math.ceil(dataMax * 1.1)); }
        return { chartData: data, yAxisDomain: [domainMin, domainMax] as [number, number] };
    }, [benchmarkResult, activeMetric]);

    if (!benchmarkResult && !gpuBenchmarkResult) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-center mb-4"><div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-full text-slate-500 dark:text-slate-400"><ChartBarIcon className="w-12 h-12" /></div></div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">No Simulation Data</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Please run a benchmark from the <span className="font-semibold text-cyan-500 dark:text-cyan-400">CPU or GPU Simulator</span> pages to see the performance analysis.</p>
            </div>
        );
    }
    
    const metricConfig = [
        { key: 'totalCycles', name: 'Total Cycles', higherIsBetter: false, format: (v: number) => v.toLocaleString(), validationKey: 'totalCycles' },
        { key: 'amat', name: 'AMAT (Cycles)', higherIsBetter: false, format: (v: number) => v.toFixed(2), validationKey: null },
        { key: 'ipc', name: 'IPC', higherIsBetter: true, format: (v: number) => v.toFixed(2), validationKey: null },
        { key: 'power.total', name: 'Total Power (Watts)', higherIsBetter: false, format: (v: number) => v.toFixed(3), validationKey: null },
        { key: 'operatingTemp', name: 'Operating Temp (°C)', higherIsBetter: false, format: (v: number) => v.toFixed(1), validationKey: 'operatingTemp' },
        { key: 'throttlingPercent', name: 'Throttling (%)', higherIsBetter: false, format: (v: number) => v.toFixed(1), validationKey: null }
    ];

    const metricButtons: ChartMetric[] = ['totalCycles', 'amat', 'ipc', 'operatingTemp'];
    
    const powerImprovement = benchmarkResult ? ((benchmarkResult['2D Baseline'].power.total - benchmarkResult['3D Stacked'].power.total) / benchmarkResult['2D Baseline'].power.total) * 100 : 0;
    const tempDiff = benchmarkResult ? benchmarkResult['3D Stacked'].operatingTemp - benchmarkResult['2D Baseline'].operatingTemp : 0;
    
    const power2D = benchmarkResult ? benchmarkResult['2D Baseline'].power : null;
    const power3D = benchmarkResult ? benchmarkResult['3D Stacked'].power : null;
    const maxPower = benchmarkResult && power2D && power3D ? Math.max(power2D.dynamic, power2D.static, power3D.dynamic, power3D.static, 0.001) : 0.001;

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-x-4">
                <button onClick={exportToJson} className="flex items-center space-x-2 text-sm bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Export All to JSON</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-cyan-500/10 p-2 rounded-md"><SparklesIcon className="w-6 h-6 text-cyan-500" /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI-Powered Insights</h3>
                </div>
                {isAiLoading && <div className="text-center p-8 text-slate-600 dark:text-slate-300">Generating expert analysis...</div>}
                {aiError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-700 dark:text-red-300 flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{aiError}</span>
                    </div>
                )}
                {aiInsights && <AiInsights insights={aiInsights} />}
            </div>

            {benchmarkResult && (
                <details open className="group">
                    <summary className="list-none flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">CPU Benchmark Analysis</h2>
                        <ChevronDownIcon className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-8 space-y-8">
                         <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Executive Summary: 2D vs. 3D</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatCard icon={<RocketLaunchIcon className="w-6 h-6 text-green-500"/>} title="Performance Gain" value={`+${benchmarkResult.improvement.toFixed(1)}%`} description="Reduction in total execution cycles." valueColor="text-green-600 dark:text-green-400" />
                                <StatCard icon={<LightBulbIcon className="w-6 h-6 text-cyan-500"/>} title="Power Efficiency" value={`${powerImprovement > 0 ? '+' : ''}${powerImprovement.toFixed(1)}%`} description="Reduction in total power consumption." valueColor="text-cyan-600 dark:text-cyan-400" />
                                <StatCard icon={<FireIcon className="w-6 h-6 text-amber-500"/>} title="Temperature Change" value={`${tempDiff > 0 ? '+' : ''}${tempDiff.toFixed(1)}°C`} description="Change in peak temperature (3D vs 2D)." valueColor={tempDiff > 0 ? "text-red-600 dark:text-red-500" : "text-amber-600 dark:text-amber-500"} />
                            </div>
                        </div>
                        <SystemVisualizer results={benchmarkResult} isVisualizing={true} theme={theme} />
                         <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">CPU Performance Benchmark</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-lg bg-slate-200 dark:bg-slate-900/50 p-1">
                                    {metricButtons.map(metric => (<button key={metric} onClick={() => setActiveMetric(metric)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${activeMetric === metric ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>{METRIC_DETAILS[metric].label}</button>))}
                                </div>
                            </div>
                            <div className="w-full h-80 flex justify-around items-end p-4 pt-8 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 gap-8 relative">
                                <div className="absolute top-2 left-4 text-xs text-slate-600 dark:text-slate-300">{METRIC_DETAILS[activeMetric].label} ({METRIC_DETAILS[activeMetric].unit})</div>
                                {chartData.map((item, index) => {
                                    const [minVal, maxVal] = yAxisDomain;
                                    const range = maxVal - minVal;
                                    const barHeight = range > 0 ? ((item.value - minVal) / range) * 100 : 0;
                                    const color = index === 0 ? 'bg-red-500' : 'bg-cyan-500';
                                    return (
                                        <div key={item.name} className="flex flex-col items-center w-full h-full justify-end">
                                            <div className="w-1/2 flex items-end relative" style={{ height: '100%' }}>
                                                <div className="absolute left-1/2 -translate-x-1/2 mb-1 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all duration-700 ease-in-out" style={{ bottom: `${Math.max(0, barHeight)}%` }}>{item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                                <div className={`w-full rounded-t-md transition-all duration-700 ease-in-out ${color}`} style={{ height: `${Math.max(0, barHeight)}%` }} title={`${item.name}: ${item.value.toLocaleString(undefined, {maximumFractionDigits: 2})}`}/>
                                            </div>
                                            <p className="mt-2 text-sm text-center font-medium text-slate-600 dark:text-slate-300">{item.name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center space-x-3 mb-6"><div className="bg-amber-500/10 p-2 rounded-md"><FireIcon className="w-6 h-6 text-amber-500" /></div><h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">CPU Thermal Analysis</h3></div>
                                <div className="flex justify-around items-start"><Thermometer temperature={benchmarkResult['2D Baseline'].operatingTemp} tdpLimit={config2D.thermal.tdpLimit} label="2D Baseline System"/><Thermometer temperature={benchmarkResult['3D Stacked'].operatingTemp} tdpLimit={config3D.thermal.tdpLimit} label="3D Stacked System"/></div>
                            </div>
                            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center space-x-3 mb-6"><div className="bg-sky-500/10 p-2 rounded-md"><LightBulbIcon className="w-6 h-6 text-sky-500" /></div><h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">CPU Power Analysis</h3></div>
                                {power2D && power3D && (
                                    <div className="space-y-6">
                                        {( [['2D Baseline', power2D], ['3D Stacked', power3D]] as const).map(([name, power]) => (
                                            <div key={name}>
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{name}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Total: <span className="font-bold text-base text-slate-700 dark:text-slate-200">{power.total.toFixed(3)} W</span></p>
                                                </div>
                                                <div className="space-y-2">
                                                    {/* Dynamic Power Bar */}
                                                    <div className="flex items-center group">
                                                        <span className="w-20 shrink-0 text-sm text-slate-600 dark:text-slate-300">Dynamic</span>
                                                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-5 relative">
                                                            <div 
                                                                className="bg-sky-500 h-5 rounded-full transition-all duration-500"
                                                                style={{ width: `${(power.dynamic / maxPower) * 100}%` }}
                                                            >
                                                            </div>
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{power.dynamic.toFixed(3)} W</span>
                                                        </div>
                                                    </div>
                                                    {/* Static Power Bar */}
                                                    <div className="flex items-center group">
                                                        <span className="w-20 shrink-0 text-sm text-slate-600 dark:text-slate-300">Static</span>
                                                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-5 relative">
                                                            <div 
                                                                className="bg-amber-500 h-5 rounded-full transition-all duration-500"
                                                                style={{ width: `${(power.static / maxPower) * 100}%` }}
                                                            >
                                                            </div>
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{power.static.toFixed(3)} W</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <CacheAnalysisVisualizer benchmarkResult={benchmarkResult} config2D={config2D} config3D={config3D} />
                        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">CPU Detailed Metrics</h3>
                                 <button 
                                    onClick={handlePredictHardware} 
                                    disabled={isPredicting || !!benchmarkResult.validation}
                                    className="flex items-center space-x-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>{isPredicting ? 'Predicting...' : (benchmarkResult.validation ? 'Prediction Complete' : 'Predict Hardware Performance with AI')}</span>
                                </button>
                            </div>
                            {predictionError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-md text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    <span>{predictionError}</span>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Metric</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">2D Simulated</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider">2D AI Predicted</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">3D Simulated</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider">3D AI Predicted</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Improvement</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider">Sim vs. AI Δ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
                                        {metricConfig.map(metric => {
                                            const getVal = (res: BenchmarkMetrics, key: string) => key.split('.').reduce((o, i) => o[i], res as any);
                                            const val2DSim = getVal(benchmarkResult!['2D Baseline'], metric.key);
                                            const val3DSim = getVal(benchmarkResult!['3D Stacked'], metric.key);
                                            const val2DPredicted = metric.validationKey ? benchmarkResult.validation?.['2D Baseline'][metric.validationKey as keyof HardwareValidationResult['2D Baseline']] : null;
                                            const val3DPredicted = metric.validationKey ? benchmarkResult.validation?.['3D Stacked'][metric.validationKey as keyof HardwareValidationResult['3D Stacked']] : null;
                                            
                                            let improvement = 0;
                                            if (val2DSim !== 0) { improvement = metric.higherIsBetter ? ((val3DSim - val2DSim) / Math.abs(val2DSim)) * 100 : ((val2DSim - val3DSim) / Math.abs(val2DSim)) * 100; }
                                            const isBetter = improvement > 0.01, isWorse = improvement < -0.01;
                                            const delta = val2DPredicted != null && val2DSim != null ? ((val2DPredicted - val2DSim) / val2DSim) * 100 : null;

                                            return (
                                                <tr key={metric.key}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{metric.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{metric.format(val2DSim)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-300">{val2DPredicted != null ? metric.format(val2DPredicted) : 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{metric.format(val3DSim)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-300">{val3DPredicted != null ? metric.format(val3DPredicted) : 'N/A'}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isBetter ? 'text-green-600 dark:text-green-400' : isWorse ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>{improvement.toFixed(1)}%</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${delta != null ? (Math.abs(delta) < 10 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-500') : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` : 'N/A'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {registerFile && <RegisterDisplay registerFile={registerFile} />}
                    </div>
                </details>
            )}

            {gpuBenchmarkResult && (
                <details open className="group">
                    <summary className="list-none flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">GPU Benchmark Analysis</h2>
                         <ChevronDownIcon className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-8">
                        <GpuAnalysis result={gpuBenchmarkResult} theme={theme} />
                    </div>
                </details>
            )}
        </div>
    );
};

export default Analysis;