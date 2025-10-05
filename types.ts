export interface SimResult {
  latency: number; // Main Memory Latency in Cycles
  power: number;
  bandwidth: number;
}

export interface ResultsData {
  '2D Baseline'?: SimResult;
  '3D Stacked'?: SimResult;
}

export interface RegisterFile {
  [register: string]: number;
}

export interface CacheLevelConfig {
  enabled: boolean;
  size: number; // in KB
  latency: number; // in cycles
  associativity: number;
}

export interface CacheHierarchyConfig {
  l1: CacheLevelConfig;
  l2: CacheLevelConfig;
  l3: CacheLevelConfig;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
}

export interface BenchmarkMetrics {
  totalCycles: number;
  amat: number;
  ipc: number;
  power: {
    dynamic: number; // in Watts
    static: number; // in Watts
    total: number; // in Watts
  };
  operatingTemp: number;
  throttlingPercent: number;
  cache: {
    l1: CacheMetrics;
    l2: CacheMetrics;
    l3: CacheMetrics;
  };
}

export interface HardwareValidationResult {
  '2D Baseline': {
    totalCycles: number;
    operatingTemp: number;
  };
  '3D Stacked': {
    totalCycles: number;
    operatingTemp: number;
  };
}


export interface BenchmarkResult {
  '2D Baseline': BenchmarkMetrics;
  '3D Stacked': BenchmarkMetrics;
  improvement: number;
  validation?: HardwareValidationResult;
}

// New extensive configuration types
export interface TSVConfig {
    enabled: boolean;
    latency: number; // Additional latency per TSV traversal
    powerPerBit: number; // in fJ
}

export interface ThermalConfig {
    ambientTemp: number; // in Celsius
    tdpLogicDie: number; // in Watts
    tdpMemoryDie: number; // in Watts
    thermalResistance: number; // in °C/W
    tdpLimit: number; // in Celsius
}

export interface SystemConfig {
    mainMemory: SimResult;
    cache: CacheHierarchyConfig;
    tsv: TSVConfig;
    thermal: ThermalConfig;
}

// New type for saved configurations
export interface SavedSystemConfig {
    name: string;
    timestamp: string;
    config2D: SystemConfig;
    config3D: SystemConfig;
}

// GPU Simulation Types
export interface GpuConfig {
    cores: number;
    clockSpeed: number; // in GHz
    memoryBandwidth: number; // in GB/s
    l2CacheSize: number; // in KB
    l2CacheLatency: number; // in cycles
    l2CacheAssociativity: number; // ways
    computationalIntensity: number; // Multiplier for ops/item
    maxPowerDraw: number; // in Watts
    junctionToCaseResistance: number; // °C/W
    caseToAmbientResistance: number; // °C/W
    throttleTemp: number; // in °C
    ambientTemp: number; // in °C
    thermalCapacitance: number; // in J/°C
}

export interface GpuBenchmarkResult {
    benchmarkName: string;
    config: GpuConfig;
    theoreticalTFLOPs: number;
    kernelExecutionTimeMs: number;
    computeTimeMs: number;
    memoryTimeMs: number;
    l2CacheHitRate: number;
    effectiveThroughputGbps: number;
    isMemoryBound: boolean;
    peakTemp: number; // in °C
    avgClockSpeed: number; // in GHz
    throttleTimeMs: number; // in ms
    estimatedPowerW: number; // in Watts
    averageCoreUtilization: number;
    thermalData: number[]; // Final temperatures for each core
    memoryAccessPattern?: 'sequential' | 'random' | 'strided';
}

export type Page = 'dashboard' | 'configurator' | 'simulator' | 'gpu-simulator' | 'analysis' | 'ai-assistant' | 'ethics';