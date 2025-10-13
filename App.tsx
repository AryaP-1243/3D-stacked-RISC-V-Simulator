
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Configurator from './pages/Configurator';
// FIX: Renamed the imported 'Simulator' component to 'CpuSimulator' to avoid potential naming conflicts.
import CpuSimulator from './pages/Simulator';
import Analysis from './pages/Analysis';
import AIAssistant from './pages/AIAssistant';
import GpuSimulator from './pages/GpuSimulator';
import LandingPage from './pages/LandingPage';
import Ethics from './pages/Ethics';

import { SystemConfig, BenchmarkResult, RegisterFile, Page, GpuConfig, GpuBenchmarkResult } from './types';

const DEFAULT_CONFIG_2D: SystemConfig = {
    mainMemory: { latency: 200, power: 10.5, bandwidth: 25.6 },
    cache: {
        l1: { enabled: true, size: 32, latency: 4, associativity: 8 },
        l2: { enabled: true, size: 256, latency: 12, associativity: 8 },
        l3: { enabled: true, size: 2048, latency: 35, associativity: 16 },
    },
    tsv: { enabled: false, latency: 0, powerPerBit: 0 },
    thermal: { ambientTemp: 25, tdpLogicDie: 65, tdpMemoryDie: 0, thermalResistance: 0.8, tdpLimit: 95 },
};

const DEFAULT_CONFIG_3D: SystemConfig = {
    mainMemory: { latency: 60, power: 0.1, bandwidth: 1024 },
    cache: {
        l1: { enabled: true, size: 32, latency: 4, associativity: 8 },
        l2: { enabled: true, size: 256, latency: 8, associativity: 8 },
        l3: { enabled: true, size: 2048, latency: 20, associativity: 16 },
    },
    tsv: { enabled: true, latency: 1, powerPerBit: 5 },
    thermal: { ambientTemp: 25, tdpLogicDie: 75, tdpMemoryDie: 15, thermalResistance: 1.2, tdpLimit: 95 },
};

const DEFAULT_GPU_CONFIG: GpuConfig = {
    cores: 1024,
    clockSpeed: 1.5, // GHz
    memoryBandwidth: 512, // GB/s
    l2CacheSize: 4096, // KB (4MB)
    l2CacheLatency: 20, // cycles
    l2CacheAssociativity: 16, // ways
    computationalIntensity: 1.0, // Baseline ratio of compute to memory ops
    maxPowerDraw: 250, // Watts
    junctionToCaseResistance: 0.2, // °C/W
    caseToAmbientResistance: 0.15, // °C/W
    throttleTemp: 90, // °C
    ambientTemp: 25, // °C
    thermalCapacitance: 4, // J/°C
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // CPU Simulation State
  const [config2D, setConfig2D] = useState<SystemConfig>(DEFAULT_CONFIG_2D);
  const [config3D, setConfig3D] = useState<SystemConfig>(DEFAULT_CONFIG_3D);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [registerFile, setRegisterFile] = useState<RegisterFile | null>(null);

  // GPU Simulation State
  const [gpuConfig, setGpuConfig] = useState<GpuConfig>(DEFAULT_GPU_CONFIG);
  const [gpuBenchmarkResult, setGpuBenchmarkResult] = useState<GpuBenchmarkResult | null>(null);

  useEffect(() => {
    const rememberedUser = localStorage.getItem('currentUser');
    const sessionUser = sessionStorage.getItem('currentUser');
    const loggedInUser = rememberedUser || sessionUser;

    if (loggedInUser) {
      setIsAuthenticated(true);
      setCurrentUser(loggedInUser);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = (username: string, rememberMe: boolean) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    sessionStorage.setItem('currentUser', username);
    if (rememberMe) {
      localStorage.setItem('currentUser', username);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setShowLoginPage(false); // Return to landing page
    setActivePage('dashboard');
    setBenchmarkResult(null);
    setRegisterFile(null);
    setGpuBenchmarkResult(null); // Clear GPU results on logout
  };
  
  const handleCpuSimulationComplete = (result: BenchmarkResult, registers: RegisterFile) => {
    setBenchmarkResult(result);
    setRegisterFile(registers);
    setActivePage('analysis');
  };

  const handleGpuSimulationComplete = (result: GpuBenchmarkResult) => {
    setGpuBenchmarkResult(result);
    setActivePage('analysis');
  };

  const renderPage = () => {
    switch (activePage) {
        case 'dashboard': return <Dashboard 
            setActivePage={setActivePage} 
            benchmarkResult={benchmarkResult}
            gpuBenchmarkResult={gpuBenchmarkResult}
        />;
        case 'configurator': return <Configurator 
            config2D={config2D} setConfig2D={setConfig2D}
            config3D={config3D} setConfig3D={setConfig3D}
            defaultConfig2D={DEFAULT_CONFIG_2D}
            defaultConfig3D={DEFAULT_CONFIG_3D}
        />;
        case 'simulator': return <CpuSimulator 
            config2D={config2D} 
            config3D={config3D} 
            onSimulationComplete={handleCpuSimulationComplete}
            theme={theme}
        />;
        case 'gpu-simulator': return <GpuSimulator 
            gpuConfig={gpuConfig}
            setGpuConfig={setGpuConfig}
            defaultGpuConfig={DEFAULT_GPU_CONFIG}
            onSimulationComplete={handleGpuSimulationComplete}
            theme={theme}
        />;
        case 'analysis': return <Analysis 
            benchmarkResult={benchmarkResult} 
            registerFile={registerFile} 
            gpuBenchmarkResult={gpuBenchmarkResult}
            theme={theme} 
            config2D={config2D}
            config3D={config3D}
        />;
        case 'ai-assistant': return <AIAssistant 
            config2D={config2D}
            config3D={config3D}
            gpuConfig={gpuConfig}
        />;
        case 'ethics': return <Ethics />;
        default: return <Dashboard 
            setActivePage={setActivePage} 
            benchmarkResult={benchmarkResult}
            gpuBenchmarkResult={gpuBenchmarkResult}
        />;
    }
  }

  if (!isAuthenticated) {
    if (showLoginPage) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
    return <LandingPage onShowLogin={() => setShowLoginPage(true)} />;
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-900 ${theme}`}>
      <Sidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header activePage={activePage} currentUser={currentUser} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;