import React from 'react';

interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className={`flex flex-col gap-1 mb-4 w-full ${className || ''}`}>
      <label className="text-terminal-green text-sm uppercase tracking-wider font-bold">
        {'>'} {label}
      </label>
      <input
        className={`
          bg-terminal-black border-b-2 
          ${error ? 'border-terminal-red text-terminal-red' : 'border-terminal-dim text-terminal-green'}
          focus:outline-none focus:border-terminal-green
          py-2 px-1 font-mono text-lg transition-colors duration-200
          placeholder-terminal-dim/30
        `}
        autoComplete="off"
        spellCheck={false}
        {...props}
      />
      {error && (
        <span className="text-terminal-red text-xs mt-1 animate-pulse">
          [!] {error}
        </span>
      )}
    </div>
  );
};
