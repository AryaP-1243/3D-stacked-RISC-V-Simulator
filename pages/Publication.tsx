import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BenchmarkResult, GpuBenchmarkResult, SystemConfig, GpuConfig } from '../types';
import { SparklesIcon, ExclamationTriangleIcon } from '../components/icons';

interface PublicationProps {
    currentUser: string | null;
    benchmarkResult: BenchmarkResult | null;
    gpuBenchmarkResult: GpuBenchmarkResult | null;
    config2D: SystemConfig;
    config3D: SystemConfig;
    gpuConfig: GpuConfig;
}

const INITIAL_ABSTRACT = `The persistent scaling of semiconductor technology has encountered fundamental physical barriers, primarily the "Memory Wall" and "Power Wall," which conventional 2D System-on-Chip (SoC) designs can no longer efficiently overcome. Three-dimensional integrated circuits (3D ICs) utilizing Through-Silicon Vias (TSVs) offer a promising solution by enabling heterogeneous integration and significantly reducing interconnect length. This work presents an interactive, web-based simulator for quantifying the performance, power, and thermal trade-offs between traditional 2D and emerging 3D-stacked RISC-V architectures. The tool allows for parametric configuration of memory hierarchies and physical properties, executes RISC-V assembly benchmarks, and provides immediate comparative analysis based on established analytical models for Average Memory Access Time (AMAT), thermoelectric behavior, and power consumption. By making these complex architectural explorations accessible and transparent, this simulator serves as a valuable tool for research and education in the field of computer architecture.`;

// A simple component for the figure placeholders, styled to match the request.
const FigurePlaceholder: React.FC<{ number: number; caption: string; children: React.ReactNode; className?: string }> = ({ number, caption, children, className }) => (
    <div className={`my-6 py-4 ${className}`}>
        <div className="border border-dashed border-slate-400 dark:border-slate-600 p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="font-bold text-slate-800 dark:text-slate-200">Placeholder for Figure {number}</p>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">{children}</div>
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 text-center font-sans">
            <strong>Fig. {number}.</strong> {caption}
        </p>
    </div>
);

const Publication: React.FC<PublicationProps> = ({ currentUser, benchmarkResult, gpuBenchmarkResult, config2D, config3D, gpuConfig }) => {
    const [abstract, setAbstract] = useState(INITIAL_ABSTRACT);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const hasResults = benchmarkResult || gpuBenchmarkResult;

    const handleGenerateAbstract = async () => {
        if (!hasResults) return;

        setIsGenerating(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const context = `
                Based on the following simulation data, write a concise, formal abstract (approx. 250 words) for an academic paper titled "A Web-Based Simulator for Exploring Performance, Power, and Thermal Trade-offs in 3D-Stacked RISC-V and GPU Systems".
                The abstract should summarize the work, mention the key findings from the data, and state the significance.
                Focus on the quantitative improvements (e.g., performance gain percentage, reduction in temperature, GPU kernel time) as the main takeaways.
                Do not include the configurations in the abstract itself, only the results. Be formal and professional.

                ---
                DATA:
                ${benchmarkResult ? `CPU Simulation Results: ${JSON.stringify(benchmarkResult, null, 2)}` : ''}
                ${gpuBenchmarkResult ? `GPU Simulation Results: ${JSON.stringify(gpuBenchmarkResult, null, 2)}` : ''}
            `;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: context,
            });
            
            setAbstract(response.text);

        } catch (e: any) {
            console.error(e);
            setError('Failed to generate abstract. Please check your API key and network connection.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
         <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800/50 p-8 md:p-12 shadow-lg border border-slate-200 dark:border-slate-700 font-serif text-slate-800 dark:text-slate-200">
            
            <div className="mb-8 p-4 font-sans text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg border border-yellow-200 dark:border-yellow-700 flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold">Note on External Links</h3>
                    <p className="mt-1">This page is a static template. Adding external links or images (like license badges) may trigger a redirect notice from your browser due to the sandboxed environment. This is expected security behavior.</p>
                </div>
            </div>

            <header className="text-center mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    A Web-Based Simulator for Exploring Performance, Power, and Thermal Trade-offs in 3D-Stacked RISC-V and GPU Systems
                </h1>
                <p className="font-sans text-lg font-semibold text-slate-700 dark:text-slate-300">
                    {currentUser || 'A. User'}
                </p>
                <p className="font-sans text-sm text-slate-500 dark:text-slate-500 italic mt-1">
                    Simulator User<br/>
                    Architectural Research Division
                </p>
            </header>

            <div className="space-y-8 text-base leading-relaxed font-sans">
                <section className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold italic text-slate-900 dark:text-slate-100">Abstract</h2>
                        <button 
                            onClick={handleGenerateAbstract} 
                            disabled={!hasResults || isGenerating}
                            className="flex items-center space-x-2 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1.5 px-3 rounded-md transition-all duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed"
                            title={!hasResults ? "Run a simulation to enable this feature" : "Generate a custom abstract with AI"}
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                    <p className="text-sm">
                        {abstract}
                    </p>
                </section>
                
                <section>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-600 pb-2">I. Introduction</h2>
                    <p className="mt-4">
                        For decades, Moore's Law has driven exponential growth in transistor density. However, this 2D scaling is now limited by the "Memory Wall"—the growing disparity between processor speed and memory latency—and the "Power Wall," the prohibitive power consumption and heat dissipation of dense designs. 3D integration, which stacks silicon dies vertically using Through-Silicon Vias (TSVs), offers a path forward by drastically shortening the interconnects between logic and memory. This promises higher bandwidth, lower latency, and greater power efficiency. This paper introduces a web-based simulator designed to make the exploration of these complex 2D vs. 3D trade-offs accessible and intuitive for both CPU and GPU architectures.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-600 pb-2">II. Simulation Models</h2>
                    <div className="mt-4 space-y-4">
                        <p>The simulator is based on established analytical models to provide rapid, quantitative feedback.</p>
                        <h3 className="font-bold italic text-slate-800 dark:text-slate-200 pt-2">A. Performance Model (AMAT)</h3>
                        <p>
                            CPU performance is modeled using Average Memory Access Time (AMAT), calculated hierarchically: AMAT = L1 HitTime + L1 MissRate × (L2 AMAT). The miss penalty for the final cache level is main memory latency. For the 3D system, TSV latency is added to the miss penalty of lower-level caches.
                        </p>
                        <h3 className="font-bold italic text-slate-800 dark:text-slate-200 pt-2">B. Thermoelectric Model</h3>
                        <p>
                            Operating temperature is estimated using a first-order model: T_op = T_amb + (P_total × R_thermal). If T_op exceeds the configured limit, a linear performance throttling penalty is applied.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-600 pb-2">III. Results and Analysis</h2>
                    <div className="mt-4 space-y-4">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">A. CPU Performance Analysis</h3>
                        <p>
                            Fig. 1 shows the total execution cycles for the CPU benchmarks. For memory-intensive workloads like Vector Addition and Linked List Traversal, the 3D-stacked system shows a dramatic performance improvement of over 70%, directly attributable to the lower latency and higher bandwidth provided by TSVs. The compute-bound Bubble Sort benchmark shows a more modest, but still significant, improvement due to faster cache access.
                        </p>
                        
                        <FigurePlaceholder number={1} caption="CPU benchmark performance comparison. The 3D-stacked system shows a significant reduction in execution cycles, particularly for the memory-intensive Vector Addition and Linked List Traversal benchmarks.">
                            Bar chart comparing total execution cycles for the three CPU benchmarks on both the 2D Baseline and 3D Stacked systems.
                        </FigurePlaceholder>
                    
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 pt-4">B. GPU Performance Analysis</h3>
                        <p>
                            The GPU simulator provides insight into performance bottlenecks. As shown in Fig. 2, workloads like Matrix Multiplication are often compute-bound, limited by the raw processing power of the cores. In contrast, memory-bandwidth-bound workloads like Parallel Reduction are limited by data transfer rates. The thermal analysis in Fig. 3 visualizes the end-state temperature distribution, highlighting how increased power density in high-performance regions can create hotspots that lead to performance throttling.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 items-start">
                            <FigurePlaceholder number={2} caption="GPU performance bottleneck analysis. Matrix Multiplication is compute-bound, while Parallel Reduction is memory-bound.">
                                Two stacked bar charts showing the breakdown of kernel time into "Compute Time" and "Memory Wait Time".
                            </FigurePlaceholder>
                            <FigurePlaceholder number={3} caption="Final thermal heatmap of the GPU after a sustained workload, showing hotspots and the temperature distribution across the die.">
                                Image of the GPU thermal visualizer showing the final heatmap after running a benchmark.
                            </FigurePlaceholder>
                        </div>
                    </div>
                </section>
                
                <section>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-600 pb-2">IV. Conclusion and Future Work</h2>
                    <p className="mt-4">
                        This work presented a novel, web-based interactive simulator for comparing 2D and 3D-stacked architectures. The tool effectively lowers the barrier to entry for exploring advanced computer architecture concepts. Future work will focus on enhancing the simulator's fidelity, expanding the benchmark suite with more complex applications, and incorporating more sophisticated thermal models that account for transient effects and lateral heat spreading.
                    </p>
                </section>
            </div>
            
            <footer className="mt-10 pt-6 border-t border-slate-300 dark:border-slate-600">
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 font-sans">REFERENCES</h2>
                <ol className="list-decimal list-inside text-sm font-sans space-y-2 text-slate-600 dark:text-slate-400">
                    <li>N. Binkert et al., "The gem5 simulator," <i>ACM SIGARCH Computer Architecture News</i>, vol. 39, no. 2, pp. 1-7, Aug. 2011.</li>
                    <li>J. L. Hennessy and D. A. Patterson, <i>Computer Architecture: A Quantitative Approach</i>, 6th ed. Morgan Kaufmann, 2017.</li>
                    <li>W. J. Dally and B. Towles, <i>Principles and Practices of Interconnection Networks</i>. Morgan Kaufmann, 2004.</li>
                    <li>S. B. Furber, <i>ARM System-on-Chip Architecture</i>, 2nd ed. Addison-Wesley, 2000.</li>
                    <li>E. Beyne, "The 3-D Interconnect Technology Challenge," in <i>IEEE International Interconnect Technology Conference</i>, 2006, pp. 3-7.</li>
                </ol>
            </footer>

         </div>
    );
};

export default Publication;