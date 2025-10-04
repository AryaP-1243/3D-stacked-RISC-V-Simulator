import React from 'react';

// A robust set of opcodes and registers based on the benchmark examples and RISC-V standards
const RISCV_OPCODES = new Set(['li', 'mv', 'addi', 'add', 'sub', 'mul', 'slli', 'srli', 'and', 'lw', 'lb', 'sw', 'sb', 'bne', 'beq', 'blt', 'bge', 'ble', 'j', 'jal', 'jr', 'rem', 'srli', 'xor', 'andi', 'not', 'sll']);
const RISCV_REGISTERS = new Set(['x0', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'x17', 'x18', 'x19', 'x20', 'x21', 'x22', 'x23', 'x24', 'x25', 'x26', 'x27', 'x28', 'x29', 'x30', 'x31', 'zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2', 's0', 'fp', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6']);

const SyntaxHighlighter: React.FC<{ code: string }> = ({ code }) => {
    const highlight = (line: string) => {
        // 1. Handle comments first
        const commentIndex = line.indexOf('#');
        let codePart = line;
        let commentPart = '';
        if (commentIndex !== -1) {
            codePart = line.substring(0, commentIndex);
            commentPart = line.substring(commentIndex);
        }

        // 2. Handle labels
        const labelMatch = codePart.match(/^(\s*)(\w+):(\s*)/);
        const elements: React.ReactNode[] = [];
        let remainingCode = codePart;

        if (labelMatch) {
            const [fullMatch, leadingWhitespace, label, trailingWhitespace] = labelMatch;
            if (leadingWhitespace) elements.push(leadingWhitespace);
            elements.push(<span key="label" className="text-green-600 dark:text-green-400">{label}:</span>);
            if (trailingWhitespace) elements.push(trailingWhitespace);
            remainingCode = codePart.substring(fullMatch.length);
        }

        // 3. Tokenize and highlight the rest of the code part
        const tokens = remainingCode.split(/([,\s()])/).filter(Boolean);
        
        tokens.forEach((token, index) => {
            const lowerToken = token.toLowerCase();
            if (RISCV_OPCODES.has(lowerToken)) {
                elements.push(<span key={`${index}-op`} className="text-cyan-600 dark:text-cyan-400 font-medium">{token}</span>);
            } else if (RISCV_REGISTERS.has(lowerToken)) {
                elements.push(<span key={`${index}-reg`} className="text-purple-600 dark:text-purple-400">{token}</span>);
            } else if (!isNaN(parseFloat(token)) && isFinite(token as any)) {
                elements.push(<span key={`${index}-num`} className="text-amber-600 dark:text-amber-500">{token}</span>);
            } else {
                elements.push(token);
            }
        });

        // 4. Append the comment part if it exists
        if (commentPart) {
            elements.push(<span key="comment" className="text-slate-600 dark:text-slate-500 italic">{commentPart}</span>);
        }

        // To prevent line collapse on empty lines, render a non-breaking space
        if (line.trim() === '') {
            return '\u00A0';
        }
        
        return elements;
    };

    return (
        <code className="whitespace-pre">
            {code.split('\n').map((line, i) => (
                <div key={i}>{highlight(line)}</div>
            ))}
        </code>
    );
};


interface CodeEditorProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows: number;
    placeholder?: string;
    id?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, ...props }) => {
    // Shared classes for both textarea and pre to ensure perfect alignment
    const sharedClasses = "block w-full font-mono text-xs p-3 leading-relaxed";
    
    // Classes for the main container div
    const containerClasses = "mt-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition-shadow";

    return (
        <div className={`${containerClasses} relative`}>
            <pre className={`${sharedClasses} overflow-auto pointer-events-none text-left`} aria-hidden="true">
                <SyntaxHighlighter code={value} />
                {/* Add a newline to ensure the last line is visible even if empty */}
                {value.endsWith('\n') && <br/>}
            </pre>
            <textarea
                value={value}
                onChange={onChange}
                className={`${sharedClasses} absolute inset-0 w-full h-full bg-transparent text-transparent caret-slate-800 dark:caret-slate-200 resize-none overflow-auto focus:outline-none`}
                spellCheck="false"
                {...props}
            />
        </div>
    );
};

export default CodeEditor;