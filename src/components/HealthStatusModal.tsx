import React from 'react';
import { HealthData } from '../types/weather';
import { CheckCircle2, AlertTriangle, ShieldCheck, Server, X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0a2032] border border-[#194362] rounded-2xl max-w-md w-full p-6 text-cyan-50 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-cyan-400/70 hover:text-white hover:bg-[#123650] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-cyan-50">Service Health & Diagnostics</h3>
            <p className="text-xs text-cyan-200/70">Serverless API status check</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-cyan-200/70">
            Pinging weather provider...
          </div>
        ) : health ? (
          <div className="space-y-3 my-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c263c] border border-[#173e5a]">
              <span className="text-xs text-cyan-200/80">Provider Connection</span>
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {health.providerResponding ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span className="text-teal-400">Active</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Degraded</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c263c] border border-[#173e5a]">
              <span className="text-xs text-cyan-200/80">Upstream HTTP Status</span>
              <span className="text-xs font-mono font-medium text-cyan-100">
                {health.upstreamStatus} {health.upstreamStatus === 200 ? 'OK' : ''}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c263c] border border-[#173e5a]">
              <span className="text-xs text-cyan-200/80">API Key Configured</span>
              <span className="flex items-center gap-1.5 text-xs font-mono">
                {health.keyConfigured ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span className="text-teal-400">Yes (Configured)</span>
                  </>
                ) : (
                  <span className="text-cyan-300/70">No (Public Tier)</span>
                )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#081a28]/60 border border-[#14354c] text-[11px] text-cyan-200/70 leading-relaxed">
              Diagnostic calls ping data.gov.sg real-time endpoints. In accordance with security policies, API credentials are never transmitted to or displayed in the client.
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-cyan-300">
            Health status unavailable.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onRefresh}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#0e2c44] hover:bg-[#123652] text-cyan-200 border border-[#194362] transition-colors"
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
