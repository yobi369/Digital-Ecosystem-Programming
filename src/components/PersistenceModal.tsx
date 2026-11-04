import React, { useRef, useState } from 'react';
import { EcosystemEngine } from '../engine/simulation';
import {
  Save,
  Upload,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface PersistenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: EcosystemEngine;
  onWorldLoaded?: () => void;
}

export const PersistenceModal: React.FC<PersistenceModalProps> = ({
  isOpen,
  onClose,
  engine,
  onWorldLoaded,
}) => {
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportJSON = () => {
    try {
      const dataStr = engine.exportState();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ecosystem_snapshot_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('World snapshot exported successfully as JSON!');
    } catch {
      showToast('Failed to export world state.', 'error');
    }
  };

  const handleExportManifest = () => {
    try {
      const manifest = engine.createExperimentManifest();
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ecosystem_experiment_manifest_' + Date.now() + '.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Versioned experiment manifest exported.');
    } catch {
      showToast('Failed to export experiment manifest.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const csvStr = engine.exportTelemetryCSV();
      const blob = new Blob([csvStr], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ecosystem_telemetry_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Telemetry time-series exported as CSV for R/Python analysis!');
    } catch {
      showToast('Failed to export CSV telemetry.', 'error');
    }
  };

  const handleSaveToBrowser = () => {
    try {
      const state = engine.exportState();
      localStorage.setItem('ecosystem_saved_world', state);
      showToast('World state successfully saved to browser local storage!');
    } catch {
      showToast('Failed to save to local storage (quota exceeded).', 'error');
    }
  };

  const handleLoadFromBrowser = () => {
    try {
      const state = localStorage.getItem('ecosystem_saved_world');
      if (!state) {
        showToast('No saved world found in browser storage.', 'error');
        return;
      }
      const ok = engine.importState(state);
      if (ok) {
        showToast('World state restored successfully!');
        if (onWorldLoaded) onWorldLoaded();
      } else {
        showToast('Corrupt or incompatible save data.', 'error');
      }
    } catch {
      showToast('Failed to load world state.', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = engine.importState(content);
        if (ok) {
          showToast('World snapshot imported successfully!');
          if (onWorldLoaded) onWorldLoaded();
        } else {
          showToast('Invalid ecosystem JSON structure.', 'error');
        }
      } catch {
        showToast('Failed to parse uploaded JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        id="persistence-export-modal"
        className="w-full max-w-2xl bg-[#120b22] border border-purple-700/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] p-5 lg:p-6 text-purple-100 flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-600/50">
              <Save className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Save, Load & Research Data Export</h3>
              <p className="text-xs text-purple-400">
                Backup world checkpoints, share simulated biospheres, or export raw telemetry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Toast Alert */}
        {notification && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-mono border ${
              notification.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quick Browser Save/Load */}
          <div className="p-4 rounded-xl bg-[#090514] border border-purple-900/50 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <Save className="w-4 h-4 text-purple-400" />
              <span>Browser Checkpoint</span>
            </div>
            <p className="text-xs text-purple-400">
              Quickly stash your living simulation in browser local storage or restore the latest snapshot.
            </p>
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={handleSaveToBrowser}
                className="flex-1 py-2 px-3 rounded-lg bg-purple-800/60 hover:bg-purple-700 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save World</span>
              </button>
              <button
                onClick={handleLoadFromBrowser}
                className="flex-1 py-2 px-3 rounded-lg bg-cyan-950 border border-cyan-700/50 hover:bg-cyan-900/60 text-cyan-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Load World</span>
              </button>
            </div>
          </div>

          {/* JSON File Export / Import */}
          <div className="p-4 rounded-xl bg-[#090514] border border-purple-900/50 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>JSON Biosphere File</span>
            </div>
            <p className="text-xs text-purple-400">
              Download complete genome archives, organism matrices, and climate settings to disk.
            </p>
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-950 border border-emerald-700/50 hover:bg-emerald-900/60 text-emerald-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-lg bg-purple-950 border border-purple-800 hover:bg-purple-900/60 text-purple-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Research Telemetry CSV */}
          <div className="p-4 rounded-xl bg-[#090514] border border-purple-900/50 flex flex-col gap-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Research CSV Telemetry Export</span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                {engine.history.length} data samples recorded
              </span>
            </div>
            <p className="text-xs text-purple-400">
              Export telemetry and a versioned manifest with the seed, model revision, initial-state fingerprint, parameters, and run/step metadata. Keep the matching world snapshot and intervention notes when replaying imported or interactively modified worlds.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleExportCSV}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Telemetry CSV</span>
              </button>
              <button
                onClick={handleExportManifest}
                className="py-2.5 px-4 rounded-xl bg-purple-800/70 hover:bg-purple-700 border border-purple-600/50 text-purple-100 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>Export Experiment Manifest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
