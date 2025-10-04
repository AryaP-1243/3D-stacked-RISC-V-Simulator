import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from './icons';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900/70 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden my-4">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-200 dark:bg-slate-800/50">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{language}</span>
        <button onClick={handleCopy} className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-200">
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-4 h-4" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-slate-800 dark:text-slate-300">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;