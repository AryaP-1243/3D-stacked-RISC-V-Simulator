import React, { useMemo } from 'react';

interface GpuVisualizerProps {
    cores: number;
    theme: 'light' | 'dark';
    temperatures: number[];
    ambientTemp: number;
    throttleTemp: number;
}

const getTempColor = (temp: number, ambient: number, throttle: number, theme: 'light' | 'dark'): string => {
    // White-hot for overheating
    if (temp > throttle) {
        const overheatRatio = Math.min(1, (temp - throttle) / 15); // How much over, capped at 15C over
        const lightness = 95 - (overheatRatio * 25); // from 95% down to 70%
        return `hsl(45, 100%, ${lightness}%)`; // Very bright, slightly orange-yellow
    }
    
    if (temp <= ambient) {
        return theme === 'dark' ? '#334155' : '#e2e8f0'; // Cool, inactive color (slate-700 / slate-200)
    }

    const tempRatio = Math.max(0, Math.min(1, (temp - ambient) / (throttle - ambient)));

    // Multi-stop gradient from Blue -> Cyan -> Green -> Yellow -> Red
    let hue;
    if (tempRatio < 0.25) { // Blue to Cyan
        hue = 240 - (tempRatio / 0.25) * 60;
    } else if (tempRatio < 0.5) { // Cyan to Green
        hue = 180 - ((tempRatio - 0.25) / 0.25) * 60;
    } else if (tempRatio < 0.75) { // Green to Yellow
        hue = 120 - ((tempRatio - 0.5) / 0.25) * 60;
    } else { // Yellow to Red
        hue = 60 - ((tempRatio - 0.75) / 0.25) * 60;
    }
    
    return `hsl(${hue}, 100%, 55%)`;
};


const GpuVisualizer: React.FC<GpuVisualizerProps> = ({ cores, theme, temperatures, ambientTemp, throttleTemp }) => {
    const gridDimensions = useMemo(() => {
        const num = Math.min(cores, 256); // Cap visualization at 256 cores for clarity
        const sqrt = Math.sqrt(num);
        let cols = Math.ceil(sqrt);
        let rows = Math.ceil(num / cols);
        if (cols === 0) cols = 1;
        if (rows === 0) rows = 1;
        return { cols, rows, total: rows * cols };
    }, [cores]);
    
    return (
        <div 
            className="grid gap-1 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
            style={{ gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(0, 1fr))` }}
        >
            {Array.from({ length: gridDimensions.total }).map((_, i) => {
                const temp = temperatures[i] ?? ambientTemp;
                const color = getTempColor(temp, ambientTemp, throttleTemp, theme);
                const isWithinCoreLimit = i < Math.min(cores, 256);
                
                if (!isWithinCoreLimit) {
                    return <div key={i} className="w-full aspect-square rounded-sm" />;
                }
                
                return (
                    <div
                        key={i}
                        className="w-full aspect-square rounded-sm transition-colors duration-100"
                        style={{ backgroundColor: color }}
                        title={`Core ${i + 1}: ${temp.toFixed(1)}°C`}
                    />
                );
            })}
        </div>
    );
};

export default GpuVisualizer;
