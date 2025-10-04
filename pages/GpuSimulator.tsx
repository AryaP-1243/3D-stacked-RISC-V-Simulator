import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GpuConfig, GpuBenchmarkResult } from '../types';
import { PlayIcon, Squares2X2Icon, ArrowUturnLeftIcon, InformationCircleIcon, XMarkIcon } from '../components/icons';
import GpuVisualizer from '../components/GpuVisualizer';

interface GpuSimulatorProps {
    gpuConfig: GpuConfig;
    setGpuConfig: React.Dispatch<React.SetStateAction<GpuConfig>>;
    defaultGpuConfig: GpuConfig;
    onSimulationComplete: (result: GpuBenchmarkResult) => void;
    theme: 'light' | 'dark';
}

type GpuBenchmark = string; // Now a string to accommodate custom key
type MemoryAccessPattern = 'sequential' | 'strided' | 'random';

interface GpuBenchmarkInfo {
    name: string;
    opsPerItem: number;
    dataPerItem: number;
    totalItems: number;
    localityFactor: number;
    description: {
        intensity: string;
        accessPattern: string;
        applications: string;
    };
}

const GPU_BENCHMARKS: { [key: string]: GpuBenchmarkInfo } = {
    // Machine Learning
    'ml:gemm_small': { name: 'ML: GEMM (Small)', opsPerItem: 2 * 512, dataPerItem: 4, totalItems: 512 * 512, localityFactor: 0.95, description: { intensity: "High", accessPattern: "Strided", applications: "Neural Networks" } },
    'ml:gemm_large': { name: 'ML: GEMM (Large)', opsPerItem: 2 * 4096, dataPerItem: 4, totalItems: 4096 * 4096, localityFactor: 0.9, description: { intensity: "Very High", accessPattern: "Strided, potential cache capacity issues", applications: "Large DL Models" } },
    'ml:sparse_gemm': { name: 'ML: Sparse GEMM', opsPerItem: 2 * 1024, dataPerItem: 12, totalItems: 1024 * 1024, localityFactor: 0.3, description: { intensity: "Medium", accessPattern: "Irregular, indirect memory access", applications: "Recommender Systems, Graph NN" } },
    'ml:conv_small_kernel': { name: 'ML: Convolution (3x3)', opsPerItem: 2 * 9, dataPerItem: 4, totalItems: 1024 * 1024, localityFactor: 0.98, description: { intensity: "High", accessPattern: "High spatial locality", applications: "CNNs, Image Processing" } },
    'ml:conv_large_kernel': { name: 'ML: Convolution (11x11)', opsPerItem: 2 * 121, dataPerItem: 4, totalItems: 1024 * 1024, localityFactor: 0.9, description: { intensity: "Very High", accessPattern: "High spatial locality, more cache pressure", applications: "Early layers of CNNs" } },
    'ml:attention_mechanism': { name: 'ML: Attention (Simplified)', opsPerItem: 2 * 256 * 256, dataPerItem: 4, totalItems: 256, localityFactor: 0.7, description: { intensity: "Very High", accessPattern: "Mixed random and sequential", applications: "Transformers, NLP" } },
    'ml:transformer_encoder': { name: 'ML: Transformer Encoder Layer', opsPerItem: 12 * 512 * 512 * 2, dataPerItem: 4, totalItems: 1024, localityFactor: 0.75, description: { intensity: "Very High", accessPattern: "Combination of dense GEMM and scattered attention", applications: "BERT, GPT models" } },
    'ml:word2vec': { name: 'ML: Word2Vec (Skip-gram)', opsPerItem: 300, dataPerItem: 1200, totalItems: 100000, localityFactor: 0.2, description: { intensity: "Medium", accessPattern: "Highly random access into embedding matrix", applications: "Natural Language Processing" } },
    'ml:rnn_cell': { name: 'ML: RNN Cell', opsPerItem: 2 * 512 * 512, dataPerItem: 4, totalItems: 1, localityFactor: 0.9, description: { intensity: "High", accessPattern: "Sequential, dependent", applications: "Sequence modeling" } },
    'ml:lstm_cell': { name: 'ML: LSTM Cell', opsPerItem: 4 * (2 * 512 * 512), dataPerItem: 4, totalItems: 1, localityFactor: 0.85, description: { intensity: "Very High", accessPattern: "Sequential, dependent gates", applications: "Advanced sequence modeling" } },
    'ml:batch_norm': { name: 'ML: Batch Normalization', opsPerItem: 5, dataPerItem: 8, totalItems: 1024 * 1024, localityFactor: 0.6, description: { intensity: "Low", accessPattern: "Sequential", applications: "Deep Learning" } },
    'ml:max_pooling': { name: 'ML: Max Pooling Layer', opsPerItem: 4, dataPerItem: 16, totalItems: 1024 * 1024, localityFactor: 0.99, description: { intensity: "Low", accessPattern: "Strided, high locality", applications: "CNN feature extraction" } },
    'ml:activation_relu': { name: 'ML: Activation (ReLU)', opsPerItem: 1, dataPerItem: 8, totalItems: 4096 * 4096, localityFactor: 0.9, description: { intensity: "Very Low", accessPattern: "Purely sequential streaming", applications: "Component in all neural networks" } },

    // Scientific Computing
    'sci:n_body_small': { name: 'Sci: N-Body (Small N)', opsPerItem: 20 * 1024, dataPerItem: 24, totalItems: 1024, localityFactor: 0.9, description: { intensity: "High", accessPattern: "All-to-all, benefits from shared memory", applications: "Astrophysics, Molecular Dynamics" } },
    'sci:n_body_large': { name: 'Sci: N-Body (Large N)', opsPerItem: 20 * 32768, dataPerItem: 24, totalItems: 32768, localityFactor: 0.5, description: { intensity: "Very High", accessPattern: "All-to-all, memory bound", applications: "Cosmological simulations" } },
    'sci:molecular_dynamics': { name: 'Sci: Molecular Dynamics', opsPerItem: 50 * 512, dataPerItem: 24, totalItems: 32768, localityFactor: 0.8, description: { intensity: "Very High", accessPattern: "Neighborhood-based, high locality with data structures", applications: "Drug discovery, materials science" } },
    'sci:stencil_2d': { name: 'Sci: Stencil 2D', opsPerItem: 5, dataPerItem: 20, totalItems: 4096 * 4096, localityFactor: 0.98, description: { intensity: "Medium", accessPattern: "High spatial locality", applications: "PDE solvers, Fluid Dynamics" } },
    'sci:stencil_3d': { name: 'Sci: Stencil 3D', opsPerItem: 7, dataPerItem: 28, totalItems: 256 * 256 * 256, localityFactor: 0.95, description: { intensity: "Medium", accessPattern: "High spatial locality in 3D", applications: "Weather simulation, medical imaging" } },
    'sci:fluid_dynamics_lbm': { name: 'Sci: Fluid Dynamics (LBM)', opsPerItem: 100, dataPerItem: 36, totalItems: 256 * 256 * 256, localityFactor: 0.9, description: { intensity: "High", accessPattern: "Complex stencil (streaming and collision steps)", applications: "CFD simulations" } },
    'sci:weather_model_kernel': { name: 'Sci: Weather Model Kernel', opsPerItem: 250, dataPerItem: 100, totalItems: 512 * 512 * 128, localityFactor: 0.8, description: { intensity: "High", accessPattern: "Complex 3D stencil and data access", applications: "Weather forecasting" } },
    'sci:fft_1d': { name: 'Sci: 1D FFT', opsPerItem: 5 * 20, dataPerItem: 8, totalItems: 1 << 20, localityFactor: 0.4, description: { intensity: "Medium", accessPattern: "Strided, butterfly pattern", applications: "Signal processing, image analysis" } },
    'sci:fft_2d': { name: 'Sci: 2D FFT', opsPerItem: 10 * 10, dataPerItem: 8, totalItems: 2048 * 2048, localityFactor: 0.5, description: { intensity: "Medium", accessPattern: "Complex strided access", applications: "Image filtering" } },
    'sci:sparse_matrix_vector_mul': { name: 'Sci: Sparse Matrix-Vector Mul', opsPerItem: 2, dataPerItem: 12, totalItems: 1_000_000, localityFactor: 0.2, description: { intensity: "Low", accessPattern: "Irregular, indirect memory access", applications: "Finite Element Method, solvers" } },
    'sci:monte_carlo_pi': { name: 'Sci: Monte Carlo (Pi)', opsPerItem: 5, dataPerItem: 0, totalItems: 100_000_000, localityFactor: 1.0, description: { intensity: "Low, but highly parallel", accessPattern: "None (compute bound)", applications: "Financial modeling, physics" } },
    'sci:black_scholes': { name: 'Sci: Black-Scholes Option Pricing', opsPerItem: 30, dataPerItem: 20, totalItems: 10_000_000, localityFactor: 0.95, description: { intensity: "Medium", accessPattern: "Sequential streaming", applications: "Financial engineering" } },
    'sci:quantum_circuit_sim': { name: 'Sci: Quantum Circuit Sim', opsPerItem: 10 * 20, dataPerItem: 16, totalItems: 1 << 20, localityFactor: 0.6, description: { intensity: "High", accessPattern: "Strided and complex, based on gates", applications: "Quantum computing research" } },
    
    // Graphics
    'gfx:vertex_processing': { name: 'Gfx: Vertex Processing', opsPerItem: 100, dataPerItem: 48, totalItems: 1_000_000, localityFactor: 0.8, description: { intensity: "High", accessPattern: "Sequential stream", applications: "3D Graphics Pipeline" } },
    'gfx:fragment_simple': { name: 'Gfx: Fragment Shading (Simple)', opsPerItem: 20, dataPerItem: 12, totalItems: 1920 * 1080, localityFactor: 0.95, description: { intensity: "Medium", accessPattern: "High spatial locality (2D tile)", applications: "Real-time rendering" } },
    'gfx:fragment_complex': { name: 'Gfx: Fragment Shading (Complex)', opsPerItem: 200, dataPerItem: 64, totalItems: 1920 * 1080, localityFactor: 0.7, description: { intensity: "Very High", accessPattern: "High locality with some random access for textures", applications: "AAA Games" } },
    'gfx:texture_sampling_heavy': { name: 'Gfx: Heavy Texture Sampling', opsPerItem: 50, dataPerItem: 200, totalItems: 1920 * 1080, localityFactor: 0.6, description: { intensity: "Medium", accessPattern: "High locality with trilinear/anisotropic filtering", applications: "Advanced texturing in games" } },
    'gfx:ambient_occlusion': { name: 'Gfx: Ambient Occlusion (SSAO)', opsPerItem: 64, dataPerItem: 16, totalItems: 1920 * 1080, localityFactor: 0.9, description: { intensity: "High", accessPattern: "Random sampling in a local neighborhood", applications: "Real-time graphics" } },
    'gfx:ray_tracing_simple': { name: 'Gfx: Ray Tracing (Simple)', opsPerItem: 150, dataPerItem: 100, totalItems: 1920 * 1080, localityFactor: 0.85, description: { intensity: "Very High", accessPattern: "Coherent random access", applications: "Offline rendering, path tracing" } },
    'gfx:ray_tracing_bvh': { name: 'Gfx: Ray Tracing (BVH)', opsPerItem: 80, dataPerItem: 60, totalItems: 1920 * 1080, localityFactor: 0.6, description: { intensity: "High", accessPattern: "Incoherent random access", applications: "Real-time ray tracing" } },
    'gfx:particle_simulation': { name: 'Gfx: Particle Simulation', opsPerItem: 30, dataPerItem: 24, totalItems: 1_000_000, localityFactor: 0.5, description: { intensity: "Medium", accessPattern: "Scattered reads, sequential writes", applications: "VFX, physics engines" } },
    'gfx:geometry_shading': { name: 'Gfx: Geometry Shading', opsPerItem: 300, dataPerItem: 128, totalItems: 500_000, localityFactor: 0.8, description: { intensity: "High", accessPattern: "Stream amplification, unpredictable writes", applications: "VFX, procedural generation" } },
    'gfx:tessellation': { name: 'Gfx: Tessellation', opsPerItem: 50, dataPerItem: 64, totalItems: 200_000, localityFactor: 0.9, description: { intensity: "Medium", accessPattern: "Localized, creates high-poly geometry", applications: "Character models, terrain" } },
    'gfx:post_processing_bloom': { name: 'Gfx: Post-FX (Bloom)', opsPerItem: 10, dataPerItem: 8, totalItems: 1920 * 1080, localityFactor: 0.98, description: { intensity: "Low", accessPattern: "Image-space, separable blur filter", applications: "HDR rendering" } },
    'gfx:compute_skinning': { name: 'Gfx: Compute Skinning', opsPerItem: 80, dataPerItem: 96, totalItems: 100_000, localityFactor: 0.7, description: { intensity: "Medium", accessPattern: "Strided reads (vertices), random reads (bone matrices)", applications: "Character animation" } },

    // Data Analytics & Parallel Primitives
    'data:reduction_sum': { name: 'Data: Reduction (Sum)', opsPerItem: 1, dataPerItem: 4, totalItems: 100_000_000, localityFactor: 0.4, description: { intensity: "Low", accessPattern: "Sequential then strided", applications: "Parallel primitive" } },
    'data:reduction_max': { name: 'Data: Reduction (Max)', opsPerItem: 1, dataPerItem: 4, totalItems: 100_000_000, localityFactor: 0.4, description: { intensity: "Low", accessPattern: "Sequential then strided", applications: "Parallel primitive" } },
    'data:scan_blelloch': { name: 'Data: Scan (Prefix Sum)', opsPerItem: 2, dataPerItem: 8, totalItems: 50_000_000, localityFactor: 0.5, description: { intensity: "Low", accessPattern: "Strided, two-pass", applications: "Parallel primitive" } },
    'data:histogram': { name: 'Data: Histogram', opsPerItem: 2, dataPerItem: 4, totalItems: 100_000_000, localityFactor: 0.1, description: { intensity: "Low", accessPattern: "Random access writes (atomic conflicts)", applications: "Image processing, data analysis" } },
    'data:filter': { name: 'Data: Stream Compaction (Filter)', opsPerItem: 1, dataPerItem: 8, totalItems: 50_000_000, localityFactor: 0.7, description: { intensity: "Low", accessPattern: "Sequential reads, scattered writes", applications: "Database queries" } },
    'data:radix_sort': { name: 'Data: Radix Sort', opsPerItem: 20, dataPerItem: 4, totalItems: 20_000_000, localityFactor: 0.3, description: { intensity: "Medium", accessPattern: "Highly random access patterns", applications: "Sorting large datasets" } },
    'data:merge_sort': { name: 'Data: Merge Sort', opsPerItem: 10, dataPerItem: 8, totalItems: 10_000_000, localityFactor: 0.6, description: { intensity: "Medium", accessPattern: "Sequential blocks", applications: "Sorting" } },
    'data:bitonic_sort': { name: 'Data: Bitonic Sort', opsPerItem: 20, dataPerItem: 8, totalItems: 1 << 22, localityFactor: 0.3, description: { intensity: "Medium", accessPattern: "Highly structured strided access, but not cache friendly", applications: "Parallel sorting network" } },
    'data:database_join_hash': { name: 'Data: DB Hash Join', opsPerItem: 10, dataPerItem: 16, totalItems: 10_000_000, localityFactor: 0.2, description: { intensity: "Low", accessPattern: "Two-pass: random writes (build), sequential reads (probe)", applications: "Database query processing" } },
    'data:graph_bfs': { name: 'Data: Graph Traversal (BFS)', opsPerItem: 5, dataPerItem: 12, totalItems: 1_000_000, localityFactor: 0.1, description: { intensity: "Low", accessPattern: "Highly irregular, follows graph structure", applications: "Social network analysis, pathfinding" } },
    'data:graph_pagerank': { name: 'Data: Graph PageRank', opsPerItem: 4, dataPerItem: 8, totalItems: 1000000, localityFactor: 0.1, description: { intensity: "Low", accessPattern: "Sparse matrix-vector multiplication, irregular access", applications: "Web search, network analysis" } },
    'data:string_search_aho': { name: 'Data: String Search (Aho-Corasick)', opsPerItem: 5, dataPerItem: 4, totalItems: 100_000_000, localityFactor: 0.8, description: { intensity: "Low", accessPattern: "Sequential text read, state-machine based pointer chasing", applications: "Intrusion detection, bioinformatics" } },
    'data:k_means_clustering': { name: 'Data: K-Means Clustering', opsPerItem: 3 * 64, dataPerItem: 4 * 64, totalItems: 100_000, localityFactor: 0.7, description: { intensity: "Medium", accessPattern: "Iterative, reads all points and centroids repeatedly", applications: "Unsupervised learning" } },

    // Cryptography & Other
    'crypto:sha256': { name: 'Crypto: SHA-256 Hash', opsPerItem: 64 * 8, dataPerItem: 64, totalItems: 100_000, localityFactor: 0.99, description: { intensity: "High", accessPattern: "Highly sequential within a block", applications: "Blockchain, security" } },
    'crypto:aes_encrypt': { name: 'Crypto: AES Encryption', opsPerItem: 10 * 16 * 4, dataPerItem: 16, totalItems: 1_000_000, localityFactor: 0.8, description: { intensity: "High", accessPattern: "Table lookups and permutations", applications: "Data encryption" } },
    'custom': { name: 'Custom Benchmark', opsPerItem: 100, dataPerItem: 50, totalItems: 1_000_000, localityFactor: 0.5, description: { intensity: "User-defined", accessPattern: "User-defined", applications: "Custom workload modeling" } },
};

const ParameterInput: React.FC<{
  label: string;
  unit: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: number;
  tooltip?: string;
  isCustom?: boolean;
}> = ({ label, unit, value, onChange, step = 1, tooltip, isCustom = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center space-x-1">
                <span>{label}</span>
                {tooltip && (
                    <div className="relative group">
                        <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                        <div className="absolute bottom-full mb-2 w-60 p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 -translate-x-1/2 left-1/2">
                            {tooltip}
                        </div>
                    </div>
                )}
            </span>
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
            <input
                type="number"
                value={value}
                onChange={onChange}
                className={`block w-full rounded-none rounded-l-md ${isCustom ? "bg-purple-50 dark:bg-purple-900/20" : "bg-white dark:bg-slate-800/70"} text-slate-900 dark:text-slate-200 sm:text-sm focus:ring-purple-500 focus:border-purple-500 border border-slate-300 dark:border-slate-600 transition-colors`}
                step={step}
                min="0"
                disabled={!isCustom}
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                {unit}
            </span>
        </div>
    </div>
);


const BenchmarkInfoModal: React.FC<{
    benchmark: GpuBenchmarkInfo;
    onClose: () => void;
}> = ({ benchmark, onClose }) => {
    return (
        <div role="dialog" aria-modal="true" aria-labelledby="benchmark-title" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="benchmark-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">{benchmark.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close benchmark details">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="prose dark:prose-invert prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 max-w-none">
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Computational Intensity</h4>
                            <p>{benchmark.description.intensity}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Data Access Patterns</h4>
                            <p>{benchmark.description.accessPattern}</p>
                        </div>
                         <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Typical Applications</h4>
                            <p>{benchmark.description.applications}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const GpuSimulator: React.FC<GpuSimulatorProps> = ({ gpuConfig, setGpuConfig, defaultGpuConfig, onSimulationComplete, theme }) => {
    const [selectedBenchmarkKey, setSelectedBenchmarkKey] = useState<GpuBenchmark>('ml:gemm_large');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [liveTemperatures, setLiveTemperatures] = useState<number[]>([]);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [dynamicMetrics, setDynamicMetrics] = useState({
        elapsedTimeMs: 0,
        opsCompleted: 0,
        currentClockSpeed: gpuConfig.clockSpeed,
        isThrottling: false,
    });
    const [customBenchmark, setCustomBenchmark] = useState<GpuBenchmarkInfo>(GPU_BENCHMARKS['custom']);
    const [memoryPattern, setMemoryPattern] = useState<MemoryAccessPattern>('strided');
    
    const simIntervalRef = useRef<number | null>(null);
    
    const visualizedCores = Math.min(gpuConfig.cores, 256);
    const gridDimensions = useMemo(() => {
        const sqrt = Math.sqrt(visualizedCores);
        const cols = Math.ceil(sqrt);
        const rows = Math.ceil(visualizedCores / cols);
        return { cols, rows, total: rows * cols };
    }, [visualizedCores]);

    useEffect(() => {
        setLiveTemperatures(new Array(gridDimensions.total).fill(gpuConfig.ambientTemp));
    }, [gridDimensions.total, gpuConfig.ambientTemp]);

    useEffect(() => {
        return () => {
            if (simIntervalRef.current) {
                clearInterval(simIntervalRef.current);
            }
        };
    }, []);

    const handleConfigChange = (field: keyof GpuConfig, value: string) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0) return;
        setGpuConfig(prev => ({...prev, [field]: numericValue }));
    };

    const handleCustomBenchmarkChange = (field: keyof Omit<GpuBenchmarkInfo, 'name' | 'description'>, value: string) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0) return;
        setCustomBenchmark(prev => ({ ...prev, [field]: numericValue }));
    };

    const handleReset = () => {
        setGpuConfig(defaultGpuConfig);
    };

    const handleRunBenchmark = () => {
        setIsSimulating(true);
        setSimulationProgress(0);
        
        const initialTemps = new Array(gridDimensions.total).fill(gpuConfig.ambientTemp);
        setLiveTemperatures(initialTemps);
        setDynamicMetrics({ 
            elapsedTimeMs: 0, 
            opsCompleted: 0, 
            currentClockSpeed: gpuConfig.clockSpeed,
            isThrottling: false
        });

        if (simIntervalRef.current) clearInterval(simIntervalRef.current);

        const benchmark = selectedBenchmarkKey === 'custom' ? customBenchmark : GPU_BENCHMARKS[selectedBenchmarkKey];
        
        // --- Refined Simulation Physics & Performance ---
        const totalFlops = benchmark.opsPerItem * benchmark.totalItems;
        const totalDataBytes = benchmark.dataPerItem * benchmark.totalItems;

        // --- Calculate effective locality based on memory access pattern ---
        let effectiveLocalityFactor = benchmark.localityFactor;
        if (memoryPattern === 'sequential') {
            effectiveLocalityFactor = Math.min(0.995, benchmark.localityFactor * 1.2);
        } else if (memoryPattern === 'random') {
            effectiveLocalityFactor = benchmark.localityFactor * 0.4;
        }

        // --- Simulation State Variables ---
        let coreTemperatures = [...initialTemps];
        let opsCompleted = 0;
        let totalSimTimeMs = 0;
        let peakTemp = gpuConfig.ambientTemp;
        let totalClockSpeedSumForAvg = 0;
        let numIntervals = 0;
        let throttleTimeMs = 0;
        let currentClockSpeed = gpuConfig.clockSpeed;
        
        const { cols, rows } = gridDimensions;
        const numHotspots = Math.max(1, Math.floor(gridDimensions.total / 16));
        let hotspots = Array.from({ length: numHotspots }, () => ({
            x: Math.random() * cols,
            y: Math.random() * rows,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            intensity: 0.5 + Math.random() * 0.5
        }));


        const SIM_INTERVAL_MS = 20;
        const SIM_TIME_STEP_S = SIM_INTERVAL_MS / 1000;

        simIntervalRef.current = window.setInterval(() => {
            // 1. Performance Calculation (How much work is done in this time step)
            const flopsThisStep = gpuConfig.cores * currentClockSpeed * 1e9 * SIM_TIME_STEP_S;
            opsCompleted += flopsThisStep;

            // 2. Thermal Simulation (Power, Heat, Dissipation)
            const totalResistance = gpuConfig.junctionToCaseResistance + gpuConfig.caseToAmbientResistance;
            const powerDrawPerCore = (gpuConfig.maxPowerDraw / gpuConfig.cores) * (currentClockSpeed / gpuConfig.clockSpeed);
            
            hotspots.forEach(h => {
                h.x += h.vx;
                h.y += h.vy;
                if (h.x < 0 || h.x > cols) h.vx *= -1;
                if (h.y < 0 || h.y > rows) h.vy *= -1;
            });
            
            const newTemps = coreTemperatures.map((temp, i) => {
                const x = i % cols;
                const y = Math.floor(i / cols);
                
                let hotspotFactor = 1.0;
                hotspots.forEach(h => {
                    const distSq = (x - h.x)**2 + (y - h.y)**2;
                    hotspotFactor += h.intensity * Math.exp(-distSq / (Math.min(cols, rows) * 0.5));
                });
                
                const powerThisCore = powerDrawPerCore * hotspotFactor;

                const heatGenerated_C = (powerThisCore / gpuConfig.thermalCapacitance) * SIM_TIME_STEP_S;
                const heatDissipated_C = ((temp - gpuConfig.ambientTemp) / totalResistance / gpuConfig.thermalCapacitance) * SIM_TIME_STEP_S;
                
                return temp + heatGenerated_C - heatDissipated_C;
            });

            coreTemperatures = newTemps;
            setLiveTemperatures(newTemps);

            // 3. Throttling Logic
            const maxTemp = Math.max(...coreTemperatures);
            peakTemp = Math.max(peakTemp, maxTemp);
            
            let isThrottlingNow = false;
            if (maxTemp > gpuConfig.throttleTemp) {
                const excessTemp = maxTemp - gpuConfig.throttleTemp;
                const throttleFactor = Math.max(0.1, 1 - excessTemp * 0.05); // Reduce clock speed based on how hot it is
                currentClockSpeed = gpuConfig.clockSpeed * throttleFactor;
                throttleTimeMs += SIM_INTERVAL_MS;
                isThrottlingNow = true;
            } else {
                // Gradually recover clock speed
                currentClockSpeed = Math.min(gpuConfig.clockSpeed, currentClockSpeed + gpuConfig.clockSpeed * 0.02);
            }

            // 4. Update state
            totalSimTimeMs += SIM_INTERVAL_MS;
            totalClockSpeedSumForAvg += currentClockSpeed;
            numIntervals++;
            setSimulationProgress(Math.min(100, (opsCompleted / totalFlops) * 100));

            setDynamicMetrics({
                elapsedTimeMs: totalSimTimeMs,
                opsCompleted,
                currentClockSpeed,
                isThrottling: isThrottlingNow
            });


            // 5. Check for completion
            if (opsCompleted >= totalFlops) {
                if (simIntervalRef.current) clearInterval(simIntervalRef.current);
                setIsSimulating(false);
                setSimulationProgress(100);

                const finalAvgClock = numIntervals > 0 ? totalClockSpeedSumForAvg / numIntervals : 0;
                const theoreticalTFLOPs = (gpuConfig.cores * gpuConfig.clockSpeed * 2) / 1000; // 2 ops/cycle/core
                const computeTimeMs = (totalFlops / (gpuConfig.cores * finalAvgClock * 1e9)) * 1000;
                
                const l2CacheMissRate = 1 - effectiveLocalityFactor;
                const memoryPenaltyCycles = gpuConfig.l2CacheLatency * l2CacheMissRate;
                const memoryPenaltyTimeMs = (memoryPenaltyCycles / (finalAvgClock * 1e9)) * 1000;
                const baseMemoryTimeMs = (totalDataBytes / (gpuConfig.memoryBandwidth * 1e9)) * 1000;
                const memoryTimeMs = baseMemoryTimeMs + memoryPenaltyTimeMs;

                const kernelExecutionTimeMs = totalSimTimeMs;
                const effectiveThroughputGbps = totalDataBytes / (kernelExecutionTimeMs / 1000) / 1e9;
                
                const estimatedPowerW = gpuConfig.maxPowerDraw * (finalAvgClock / gpuConfig.clockSpeed);
                
                const maxPossibleFlops = gpuConfig.cores * finalAvgClock * 1e9 * (kernelExecutionTimeMs / 1000) * 2; // Assuming 2 FLOPS/cycle (FMA)
                const averageCoreUtilization = maxPossibleFlops > 0 ? Math.min(1, (totalFlops / maxPossibleFlops)) : 0; // Cap at 100%

                const result: GpuBenchmarkResult = {
                    benchmarkName: benchmark.name,
                    config: gpuConfig,
                    theoreticalTFLOPs,
                    kernelExecutionTimeMs,
                    computeTimeMs,
                    memoryTimeMs,
                    l2CacheHitRate: effectiveLocalityFactor,
                    effectiveThroughputGbps,
                    isMemoryBound: memoryTimeMs > computeTimeMs,
                    peakTemp,
                    avgClockSpeed: finalAvgClock,
                    throttleTimeMs,
                    estimatedPowerW,
                    averageCoreUtilization,
                    thermalData: coreTemperatures,
                    memoryAccessPattern: memoryPattern
                };

                onSimulationComplete(result);
            }

        }, SIM_INTERVAL_MS);
    };

    const benchmarkCategories = useMemo(() => {
        const categories: { [key: string]: { [key: string]: GpuBenchmarkInfo } } = {};
        Object.keys(GPU_BENCHMARKS).forEach(key => {
            const [cat, ...rest] = key.split(':');
            if (!categories[cat]) categories[cat] = {};
            categories[cat][key] = GPU_BENCHMARKS[key];
        });
        return categories;
    }, []);

    return (
        <div className="space-y-8">
             <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-500/10 p-2 rounded-md"><Squares2X2Icon className="w-6 h-6 text-purple-500" /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Benchmark Selection</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
                    <div>
                        <label htmlFor="benchmark-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Load a benchmark workload
                        </label>
                        <select
                            id="benchmark-select"
                            value={selectedBenchmarkKey}
                            onChange={e => setSelectedBenchmarkKey(e.target.value as GpuBenchmark)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md text-slate-900 dark:text-slate-200"
                        >
                           {Object.entries(benchmarkCategories).map(([categoryName, benchmarks]) => (
                                <optgroup key={categoryName} label={categoryName.toUpperCase()}>
                                    {Object.entries(benchmarks).map(([key, { name }]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </optgroup>
                           ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Memory Access Pattern
                        </label>
                         <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-slate-200 dark:bg-slate-900/50 p-1">
                            {(['sequential', 'strided', 'random'] as MemoryAccessPattern[]).map(pattern => (
                                <button key={pattern} onClick={() => setMemoryPattern(pattern)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 capitalize ${memoryPattern === pattern ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                                    {pattern}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {selectedBenchmarkKey === 'custom' && (
                    <div className="mt-6 border-t border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-lg space-y-4">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">Define Your Custom Workload</h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                            Model a unique workload by defining its core characteristics below. This allows you to simulate the performance of specialized algorithms or applications not covered by the standard benchmarks.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ParameterInput isCustom label="Ops per Item" unit="" value={customBenchmark.opsPerItem} onChange={e => handleCustomBenchmarkChange('opsPerItem', e.target.value)} tooltip="Total operations (e.g., FLOPs) performed for each work item."/>
                            <ParameterInput isCustom label="Data per Item" unit="Bytes" value={customBenchmark.dataPerItem} onChange={e => handleCustomBenchmarkChange('dataPerItem', e.target.value)} tooltip="Bytes of data read/written per work item. Higher value means more memory intensive."/>
                            <ParameterInput isCustom label="Total Items" unit="" value={customBenchmark.totalItems} onChange={e => handleCustomBenchmarkChange('totalItems', e.target.value)} tooltip="Total number of work items to process."/>
                            <ParameterInput isCustom label="Locality Factor" unit="0-1" value={customBenchmark.localityFactor} onChange={e => handleCustomBenchmarkChange('localityFactor', e.target.value)} step={0.01} tooltip="Represents L2 cache hit rate. 1.0 is 100% hits (high locality), 0.0 is 0% hits (random access)."/>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">GPU Configuration</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Adjust the parameters of your GPU architecture.</p>
                        </div>
                        <button onClick={handleReset} className="flex items-center space-x-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-md transition-all duration-200">
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                            <span>Reset</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <details open className="space-y-3">
                            <summary className="text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer">Core & Memory</summary>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <ParameterInput label="Shader Cores" unit="Cores" value={gpuConfig.cores} onChange={e => handleConfigChange('cores', e.target.value)} />
                                <ParameterInput label="Base Clock Speed" unit="GHz" value={gpuConfig.clockSpeed} onChange={e => handleConfigChange('clockSpeed', e.target.value)} step={0.1} />
                                <ParameterInput label="Mem Bandwidth" unit="GB/s" value={gpuConfig.memoryBandwidth} onChange={e => handleConfigChange('memoryBandwidth', e.target.value)} />
                                <ParameterInput label="L2 Cache Size" unit="KB" value={gpuConfig.l2CacheSize} onChange={e => handleConfigChange('l2CacheSize', e.target.value)} />
                            </div>
                        </details>
                        <details open className="space-y-3 pt-2">
                            <summary className="text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer">Thermoelectric Properties</summary>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <ParameterInput label="Max Power Draw" unit="Watts" value={gpuConfig.maxPowerDraw} onChange={e => handleConfigChange('maxPowerDraw', e.target.value)} />
                                <ParameterInput label="Thermal Capacitance" unit="J/°C" value={gpuConfig.thermalCapacitance} onChange={e => handleConfigChange('thermalCapacitance', e.target.value)} step={0.1} tooltip="The amount of energy needed to raise the GPU's temperature by 1°C. Higher is more resistant to temp spikes." />
                                <ParameterInput label="Junc-Case Resist" unit="°C/W" value={gpuConfig.junctionToCaseResistance} onChange={e => handleConfigChange('junctionToCaseResistance', e.target.value)} step={0.01} tooltip="Thermal resistance from the silicon die to the GPU cooler's contact plate." />
                                <ParameterInput label="Case-Ambient Resist" unit="°C/W" value={gpuConfig.caseToAmbientResistance} onChange={e => handleConfigChange('caseToAmbientResistance', e.target.value)} step={0.01} tooltip="Thermal resistance from the GPU cooler to the surrounding air. Represents cooler efficiency."/>
                                <ParameterInput label="Throttle Temp" unit="°C" value={gpuConfig.throttleTemp} onChange={e => handleConfigChange('throttleTemp', e.target.value)} />
                            </div>
                        </details>
                    </div>
                </div>

                {/* Visualizer & Simulation Control */}
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Live Simulation Visualizer</h3>
                     <GpuVisualizer 
                        cores={gpuConfig.cores} 
                        theme={theme} 
                        temperatures={liveTemperatures}
                        ambientTemp={gpuConfig.ambientTemp}
                        throttleTemp={gpuConfig.throttleTemp}
                    />
                    <div className="mt-4 space-y-3">
                         <div>
                            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                <span>Simulation Progress</span>
                                <span>{simulationProgress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-150" style={{ width: `${simulationProgress}%` }}></div>
                            </div>
                        </div>
                         <div className="grid grid-cols-3 gap-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/50 p-2 rounded-md">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Elapsed Time</p>
                                <p className="font-mono text-base">{(dynamicMetrics.elapsedTimeMs / 1000).toFixed(2)}s</p>
                            </div>
                             <div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Clock Speed</p>
                                <p className={`font-mono text-base ${dynamicMetrics.isThrottling ? 'text-red-500' : 'text-purple-600 dark:text-purple-400'}`}>{dynamicMetrics.currentClockSpeed.toFixed(2)} GHz</p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Ops Completed</p>
                                <p className="font-mono text-base">{(dynamicMetrics.opsCompleted / 1e12).toPrecision(3)} T</p>
                            </div>
                        </div>
                        <button onClick={handleRunBenchmark} disabled={isSimulating} className="w-full flex items-center justify-center space-x-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-200 disabled:bg-slate-500 disabled:cursor-wait">
                            <PlayIcon className="w-5 h-5" />
                            <span>{isSimulating ? 'Simulating...' : 'Run Benchmark'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {isInfoModalOpen && (
                <BenchmarkInfoModal 
                    benchmark={GPU_BENCHMARKS[selectedBenchmarkKey]} 
                    onClose={() => setIsInfoModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default GpuSimulator;