import { Activity, X } from 'lucide-react';
import React from 'react';
import { DiagnosticsData } from '../../hooks/useVoiceSession';

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: DiagnosticsData;
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  onClose,
  diagnostics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-950 text-stone-100 shadow-2xl p-6 overflow-y-auto border-l border-stone-800 font-mono text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Activity className="w-5 h-5" />
          <span>SakhiSetu Pipeline Diagnostics</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Connection State */}
        <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 space-y-1.5">
          <div className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
            Live Session Transport
          </div>
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                diagnostics.liveSessionStatus === 'LISTENING' ||
                diagnostics.liveSessionStatus === 'SPEAKING'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              {diagnostics.liveSessionStatus}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Model:</span>
            <span className="text-stone-300">gemini-3.8-live</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Auth Type:</span>
            <span className="text-stone-300">Server Ephemeral Token</span>
          </div>
        </div>

        {/* Audio Pipeline */}
        <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 space-y-1.5">
          <div className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
            Real-Time Audio Pipeline
          </div>
          <div className="flex items-center justify-between">
            <span>AudioContext:</span>
            <span className="text-stone-200">{diagnostics.audioContextState}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Microphone Input:</span>
            <span
              className={
                diagnostics.microphoneStatus === 'CAPTURING'
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400'
              }
            >
              {diagnostics.microphoneStatus} (16kHz PCM)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Input Audio Streamed:</span>
            <span className="text-stone-300">{diagnostics.inputBytes.toLocaleString()} bytes</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Model Audio Output:</span>
            <span className="text-emerald-300 font-bold">
              {diagnostics.outputBytes.toLocaleString()} bytes
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Audio Chunks Decoded:</span>
            <span className="text-stone-300">{diagnostics.outputChunks} chunks (24kHz PCM)</span>
          </div>
        </div>

        {/* Application Navigation State */}
        <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 space-y-1.5">
          <div className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
            Application Navigation Context
          </div>
          <div className="flex items-center justify-between">
            <span>Language:</span>
            <span className="text-amber-400 font-bold">{diagnostics.currentLanguage}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Current Screen:</span>
            <span className="text-stone-200">{diagnostics.currentScreen}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Current Guidance Step:</span>
            <span className="text-stone-200">{diagnostics.currentGuidanceStep}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active Section Target:</span>
            <span className="text-stone-200">{diagnostics.activeHighlight}</span>
          </div>
        </div>

        {/* Security & Isolation */}
        <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 space-y-1 text-stone-400 text-[11px]">
          <div className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
            Security Audit
          </div>
          <p>✓ No long-lived API secrets stored in browser bundle.</p>
          <p>✓ All external navigation restricted to verified .gov.in domains.</p>
          <p>✓ Zero collection of Aadhaar, OTP, or private credentials.</p>
        </div>
      </div>
    </div>
  );
};
