import React, { useState, useEffect, useRef } from 'react';
import { SystemConfig, SimResult, CacheLevelConfig, SavedSystemConfig } from '../types';
import { ArrowUturnLeftIcon, InformationCircleIcon, TableCellsIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, XMarkIcon } from '../components/icons';

interface ConfiguratorProps {
    config2D: SystemConfig;
    setConfig2D: React.Dispatch<React.SetStateAction<SystemConfig>>;
    config3D: SystemConfig;
    setConfig3D: React.Dispatch<React.SetStateAction<SystemConfig>>;
    defaultConfig2D: SystemConfig;
    defaultConfig3D: SystemConfig;
}

const ParameterInput: React.FC<{
  label: string;
  unit: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: number;
  tooltip?: string;
}> = ({ label, unit, value, onChange, step = 1, tooltip }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
        <span className="flex items-center space-x-1">
            <span>{label}</span>
            {tooltip && (
                <div className="relative group">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400" />
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
        className="block w-full rounded-none rounded-l-md bg-white dark:bg-slate-800/70 text-slate-900 dark:text-slate-200 sm:text-sm focus:ring-cyan-500 focus:border-cyan-500 border border-slate-300 dark:border-slate-600 transition-colors"
        step={step}
        min="0"
      />
      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
        {unit}
      </span>
    </div>
  </div>
);

const SliderParameterInput: React.FC<{
  label: string;
  unit: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step?: number;
  tooltip?: string;
}> = ({ label, unit, value, onChange, min, max, step = 1, tooltip }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
        <span className="flex items-center space-x-1">
            <span>{label}</span>
            {tooltip && (
                <div className="relative group">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400" />
                    <div className="absolute bottom-full mb-2 w-60 p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 -translate-x-1/2 left-1/2">
                        {tooltip}
                    </div>
                </div>
            )}
        </span>
    </label>
    <div className="mt-1 flex items-center space-x-2">
        <input
            type="range"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex rounded-md shadow-sm w-32">
            <input
                type="number"
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                className="block w-full rounded-none rounded-l-md bg-white dark:bg-slate-800/70 text-slate-900 dark:text-slate-200 sm:text-sm focus:ring-cyan-500 focus:border-cyan-500 border border-slate-300 dark:border-slate-600 transition-colors"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                {unit}
            </span>
        </div>
    </div>
  </div>
);


const Configurator: React.FC<ConfiguratorProps> = ({ config2D, setConfig2D, config3D, setConfig3D, defaultConfig2D, defaultConfig3D }) => {
    const [savedConfigs, setSavedConfigs] = useState<SavedSystemConfig[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newConfigName, setNewConfigName] = useState('');
    const [saveError, setSaveError] = useState('');
    const [showLoadMenu, setShowLoadMenu] = useState(false);
    const loadMenuRef = useRef<HTMLDivElement>(null);
    const loadButtonRef = useRef<HTMLButtonElement>(null);

    const LS_KEY = 'savedCpuConfigurations';

    useEffect(() => {
        try {
            const storedConfigs = localStorage.getItem(LS_KEY);
            if (storedConfigs) {
                setSavedConfigs(JSON.parse(storedConfigs));
            }
        } catch (error) {
            console.error("Failed to parse saved configurations from localStorage", error);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showLoadMenu &&
                loadMenuRef.current &&
                !loadMenuRef.current.contains(event.target as Node) &&
                loadButtonRef.current &&
                !loadButtonRef.current.contains(event.target as Node)
            ) {
                setShowLoadMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLoadMenu]);


    const handleConfigChange = (
        type: '2D' | '3D', 
        section: keyof SystemConfig, 
        field: any, 
        value: string,
        subfield: keyof CacheLevelConfig | null = null
    ) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0) return;

        const setConfig = type === '2D' ? setConfig2D : setConfig3D;
        
        setConfig(prev => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            if (section === 'cache' && subfield) {
                newConfig[section][field][subfield] = numericValue;
            } else {
                newConfig[section][field] = numericValue;
            }
            return newConfig;
        });
    };
    
    const handleCacheToggle = (type: '2D' | '3D', level: 'l1' | 'l2' | 'l3', enabled: boolean) => {
         const setConfig = type === '2D' ? setConfig2D : setConfig3D;
         setConfig(prev => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig.cache[level].enabled = enabled;
            return newConfig;
         });
    }

    const handleReset = () => {
        setConfig2D(defaultConfig2D);
        setConfig3D(defaultConfig3D);
    };
    
    const handleSave = () => {
        const trimmedName = newConfigName.trim();
        if (!trimmedName) {
            setSaveError('Configuration name cannot be empty.');
            return;
        }
        if (savedConfigs.some(c => c.name === trimmedName)) {
            setSaveError('A configuration with this name already exists.');
            return;
        }
        
        const newSavedConfig: SavedSystemConfig = {
            name: trimmedName,
            timestamp: new Date().toISOString(),
            config2D,
            config3D
        };
        
        const updatedConfigs = [...savedConfigs, newSavedConfig];
        setSavedConfigs(updatedConfigs);
        localStorage.setItem(LS_KEY, JSON.stringify(updatedConfigs));
        
        setShowSaveModal(false);
        setNewConfigName('');
        setSaveError('');
    };
    
    const handleLoad = (configName: string) => {
        const configToLoad = savedConfigs.find(c => c.name === configName);
        if (configToLoad) {
            setConfig2D(configToLoad.config2D);
            setConfig3D(configToLoad.config3D);
        }
        setShowLoadMenu(false);
    };
    
    const handleDelete = (configName: string) => {
        const updatedConfigs = savedConfigs.filter(c => c.name !== configName);
        setSavedConfigs(updatedConfigs);
        localStorage.setItem(LS_KEY, JSON.stringify(updatedConfigs));
    };


    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Architectural Parameters</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Set the performance and physical characteristics for each system component.</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <div className="relative">
                            <button
                                ref={loadButtonRef}
                                onClick={() => setShowLoadMenu(prev => !prev)}
                                className="flex items-center space-x-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-md transition-all duration-200"
                            >
                                <ArrowUpTrayIcon className="w-4 h-4" />
                                <span>Load</span>
                            </button>
                            {showLoadMenu && (
                                <div ref={loadMenuRef} className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-20">
                                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Load Configuration</h4>
                                    </div>
                                    <div className="p-2 max-h-60 overflow-y-auto">
                                        {savedConfigs.length > 0 ? (
                                            savedConfigs.map(config => (
                                                <div key={config.name} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 group">
                                                    <button onClick={() => handleLoad(config.name)} className="flex-1 text-left">
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(config.timestamp).toLocaleString()}</p>
                                                    </button>
                                                    <button onClick={() => handleDelete(config.name)} className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete ${config.name}`}>
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-xs text-slate-500 dark:text-slate-400 p-4">No saved configurations.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setShowSaveModal(true)} className="flex items-center space-x-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-md transition-all duration-200">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Save</span>
                        </button>
                        <button onClick={handleReset} className="flex items-center space-x-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-md transition-all duration-200">
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                            <span>Reset All</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {([['2D', config2D], ['3D', config3D]] as const).map(([type, config]) => (
                        <div key={type} className="space-y-6">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-lg">{type} {type === '2D' ? 'Baseline' : 'Stacked'} System</h4>
                            <div className="space-y-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h5 className="font-bold text-sm text-slate-600 dark:text-slate-300">Main Memory</h5>
                                <SliderParameterInput
                                    label="Latency"
                                    unit="Cycles"
                                    value={config.mainMemory.latency}
                                    onChange={e => handleConfigChange(type, 'mainMemory', 'latency', e.target.value)}
                                    min={type === '2D' ? 50 : 10}
                                    max={type === '2D' ? 500 : 200}
                                    step={1}
                                    tooltip={type === '2D' 
                                        ? "Time for the CPU to access main memory after a total cache miss. Higher values are typical for off-chip DRAM in 2D systems." 
                                        : "Time for the CPU to access the stacked memory die after a total cache miss. Drastically lower than 2D systems due to proximity."
                                    }
                                />
                                <ParameterInput label="Power" unit={type === '2D' ? 'pJ/bit' : 'fJ/bit'} value={config.mainMemory.power} onChange={e => handleConfigChange(type, 'mainMemory', 'power', e.target.value)} step={0.1} />
                                <ParameterInput label="Bandwidth" unit="GB/s" value={config.mainMemory.bandwidth} onChange={e => handleConfigChange(type, 'mainMemory', 'bandwidth', e.target.value)} />
                            </div>
                            
                            {type === '3D' && (
                                <div className="space-y-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <h5 className="font-bold text-sm text-slate-600 dark:text-slate-300">Through-Silicon Via (TSV)</h5>
                                    <ParameterInput label="TSV Latency" unit="Cycles" value={config.tsv.latency} onChange={e => handleConfigChange(type, 'tsv', 'latency', e.target.value)} />
                                    <ParameterInput label="Power per Bit" unit="fJ" value={config.tsv.powerPerBit} onChange={e => handleConfigChange(type, 'tsv', 'powerPerBit', e.target.value)} />
                                </div>
                            )}

                             <div className="space-y-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h5 className="font-bold text-sm text-slate-600 dark:text-slate-300">Thermal Properties</h5>
                                <ParameterInput label="Logic Die TDP" unit="Watts" value={config.thermal.tdpLogicDie} onChange={e => handleConfigChange(type, 'thermal', 'tdpLogicDie', e.target.value)} />
                                {type === '3D' && <ParameterInput label="Memory Die TDP" unit="Watts" value={config.thermal.tdpMemoryDie} onChange={e => handleConfigChange(type, 'thermal', 'tdpMemoryDie', e.target.value)} />}
                                <ParameterInput label="Thermal Resistance" unit="°C/W" value={config.thermal.thermalResistance} onChange={e => handleConfigChange(type, 'thermal', 'thermalResistance', e.target.value)} step={0.1} tooltip="How effectively the package dissipates heat. Higher values mean worse cooling." />
                                <ParameterInput label="TDP Limit" unit="°C" value={config.thermal.tdpLimit} onChange={e => handleConfigChange(type, 'thermal', 'tdpLimit', e.target.value)} tooltip="The maximum temperature before performance throttling begins." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center space-x-3">
                        <div className="bg-cyan-500/10 p-2 rounded-md"><TableCellsIcon className="w-6 h-6 text-cyan-500" /></div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Cache Hierarchy Simulation</h3>
                    </div>
                    <div className="relative group">
                        <InformationCircleIcon className="w-5 h-5 text-slate-400" />
                        <div className="absolute bottom-full mb-2 w-72 p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 right-0 transform translate-x-1/4">
                            <strong className="block font-bold text-slate-900 dark:text-slate-100">AMAT Heuristic Explained</strong>
                            <p className="mt-1">The simulator estimates miss rates for each cache level based on a simple heuristic to calculate the Average Memory Access Time (AMAT), a key performance metric.</p>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {([['2D', config2D], ['3D', config3D]] as const).map(([type, config]) => (
                        <div key={type} className="space-y-4">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">{type} {type === '2D' ? 'Baseline' : 'Stacked'}</h4>
                            {(['l1', 'l2', 'l3'] as const).map(level => (
                                <details key={level} className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700" open>
                                    <summary className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <input type="checkbox" checked={config.cache[level].enabled} onChange={(e) => handleCacheToggle(type, level, e.target.checked)} className="rounded border-slate-400 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-offset-0 focus:ring-cyan-200 focus:ring-opacity-50" onClick={e => e.stopPropagation()} />
                                            <span className="font-bold">{level.toUpperCase()} Cache</span>
                                        </div>
                                    </summary>
                                    <div className={`mt-4 space-y-3 ${!config.cache[level].enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                            <div>
                                                <label className="block text-slate-600 dark:text-slate-300 mb-1">Size (KB)</label>
                                                <input type="number" value={config.cache[level].size} onChange={e => handleConfigChange(type, 'cache', level, e.target.value, 'size')} className="w-full p-2 rounded-md bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-600 dark:text-slate-300 mb-1">Latency (Cycles)</label>
                                                <input type="number" value={config.cache[level].latency} onChange={e => handleConfigChange(type, 'cache', level, e.target.value, 'latency')} className="w-full p-2 rounded-md bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-600 dark:text-slate-300 mb-1">Associativity</label>
                                                <input type="number" value={config.cache[level].associativity} onChange={e => handleConfigChange(type, 'cache', level, e.target.value, 'associativity')} className="w-full p-2 rounded-md bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200" />
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            ))}
                        </div>
                    ))}
                 </div>
            </div>
            
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSaveModal(false)}>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Save Configuration</h3>
                            <button onClick={() => setShowSaveModal(false)} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="config-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Configuration Name</label>
                                <input
                                    id="config-name"
                                    type="text"
                                    value={newConfigName}
                                    onChange={(e) => { setNewConfigName(e.target.value); setSaveError(''); }}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-slate-900 dark:text-white"
                                    placeholder="e.g., High-Bandwidth 3D"
                                    autoFocus
                                />
                                {saveError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{saveError}</p>}
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button onClick={() => setShowSaveModal(false)} className="py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md">Cancel</button>
                                <button onClick={handleSave} className="py-2 px-4 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Configurator;