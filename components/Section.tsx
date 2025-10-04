import React from 'react';
import { EyeIcon, EyeSlashIcon } from './icons';

interface SectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isVisible: boolean;
  onToggleVisibility: () => void;
  isToggleable: boolean;
}

const Section: React.FC<SectionProps> = ({ title, subtitle, icon, children, isVisible, onToggleVisibility, isToggleable }) => {
  return (
    <section className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
      <div className="flex items-start justify-between p-6 md:p-8">
        <div className="flex items-start space-x-4">
          <div className="bg-slate-200 dark:bg-slate-700/50 p-3 rounded-lg text-cyan-500 dark:text-cyan-400">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">{title}</h2>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{subtitle}</p>
          </div>
        </div>
        {isToggleable && (
          <button onClick={onToggleVisibility} className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-2" aria-label={isVisible ? 'Hide section' : 'Show section'}>
            {isVisible ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
          </button>
        )}
      </div>
      {isVisible && (
        <div className="prose dark:prose-invert prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 max-w-none p-6 md:p-8 pt-0">
          {children}
        </div>
      )}
    </section>
  );
};

export default Section;