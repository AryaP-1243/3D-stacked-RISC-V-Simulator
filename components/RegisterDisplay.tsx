
import React from 'react';
import { RegisterFile } from '../types';

interface RegisterDisplayProps {
  registerFile: RegisterFile | null;
}

const ABI_NAMES: { [key: string]: string } = {
  x0: 'zero', x1: 'ra', x2: 'sp', x3: 'gp', x4: 'tp', x5: 't0', x6: 't1', x7: 't2',
  x8: 's0/fp', x9: 's1', x10: 'a0', x11: 'a1', x12: 'a2', x13: 'a3', x14: 'a4', x15: 'a5',
  x16: 'a6', x17: 'a7', x18: 's2', x19: 's3', x20: 's4', x21: 's5', x22: 's6', x23: 's7',
  x24: 's8', x25: 's9', x26: 's10', x27: 's11', x28: 't3', x29: 't4', x30: 't5', x31: 't6',
};

const RegisterDisplay: React.FC<RegisterDisplayProps> = ({ registerFile }) => {
  if (!registerFile) {
    return null;
  }
  
  // Create a complete list of 32 registers to ensure consistent ordering
  const registerNames = Array.from({ length: 32 }, (_, i) => `x${i}`);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Final Register State (Output)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 font-mono text-xs">
        {registerNames.map(reg => (
          <div key={reg} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-center">
            <div className="font-bold text-slate-800 dark:text-slate-200 truncate" title={ABI_NAMES[reg]}>{reg} ({ABI_NAMES[reg]})</div>
            <div className="text-cyan-600 dark:text-cyan-400 mt-1 break-words">{registerFile[reg] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisterDisplay;