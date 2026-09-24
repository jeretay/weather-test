import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = true }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme (currently ${theme} mode)`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
        isDark
          ? 'bg-[#0c2436] hover:bg-[#12344d] active:bg-[#184260] text-cyan-200 hover:text-white border border-[#194362] shadow-xs'
          : 'bg-[#f0f7fb] hover:bg-[#e2eef6] active:bg-[#d4e6f2] text-sky-900 hover:text-sky-950 border border-sky-200 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-cyan-300 transition-transform duration-200 rotate-0" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="capitalize font-medium tracking-tight">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
