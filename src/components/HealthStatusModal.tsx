import React from 'react';
import { HealthData } from '../types/weather';
import { CheckCircle2, AlertTriangle, ShieldCheck, Server, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HealthStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const HealthStatusModal: React.FC<HealthStatusModalProps> = ({
  isOpen,
  onClose,
  health,
  isLoading,
  onRefresh,
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl relative transition-all duration-200 ${
          isDark
            ? 'bg-[#0a2032] border-[#194362] text-cyan-50'
            : 'bg-white border-sky-200 text-slate-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-cyan-400/70 hover:text-white hover:bg-[#123650]'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-xl border ${
              isDark
                ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
                : 'bg-sky-50 border-sky-200 text-cyan-600'
            }`}
          >
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-semibold ${isDark ? 'text-cyan-50' : 'text-slate-900'}`}>
              Service Health & Diagnostics
            </h3>
            <p className={`text-xs ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
              Serverless API status check
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className={`py-8 text-center text-xs ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
            Pinging weather provider...
          </div>
        ) : health ? (
          <div className="space-y-3 my-4">
            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark
                  ? 'bg-[#0c263c] border-[#173e5a]'
                  : 'bg-[#f0f7fb] border-sky-100'
              }`}
            >
              <span className={`text-xs ${isDark ? 'text-cyan-200/80' : 'text-slate-600'}`}>
                Provider Connection
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {health.providerResponding ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    <span className="text-teal-600 font-semibold">Active</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600 font-semibold">Degraded</span>
                  </>
                )}
              </span>
            </div>

            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark
                  ? 'bg-[#0c263c] border-[#173e5a]'
                  : 'bg-[#f0f7fb] border-sky-100'
              }`}
            >
              <span className={`text-xs ${isDark ? 'text-cyan-200/80' : 'text-slate-600'}`}>
                Upstream HTTP Status
              </span>
              <span
                className={`text-xs font-mono font-medium ${
                  isDark ? 'text-cyan-100' : 'text-slate-800'
                }`}
              >
                {health.upstreamStatus} {health.upstreamStatus === 200 ? 'OK' : ''}
              </span>
            </div>

            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark
                  ? 'bg-[#0c263c] border-[#173e5a]'
                  : 'bg-[#f0f7fb] border-sky-100'
              }`}
            >
              <span className={`text-xs ${isDark ? 'text-cyan-200/80' : 'text-slate-600'}`}>
                API Key Configured
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono">
                {health.keyConfigured ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-teal-500" />
                    <span className="text-teal-600 font-semibold">Yes (Configured)</span>
                  </>
                ) : (
                  <span className={isDark ? 'text-cyan-300/70' : 'text-slate-500'}>
                    No (Public Tier)
                  </span>
                )}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                isDark
                  ? 'bg-[#081a28]/60 border-[#14354c] text-cyan-200/70'
                  : 'bg-sky-50/70 border-sky-100 text-slate-500'
              }`}
            >
              Diagnostic calls ping data.gov.sg real-time endpoints. In accordance with security policies, API credentials are never transmitted to or displayed in the client.
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-rose-500">
            Health status unavailable.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onRefresh}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#0e2c44] hover:bg-[#123652] text-cyan-200 border-[#194362]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Recheck
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

