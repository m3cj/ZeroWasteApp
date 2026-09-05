import { useState } from 'react';
import {
  User,
  Shield,
  Settings,
  LogOut,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Bell,
  Globe,
} from 'lucide-react';
import { getState, resetToSeed } from '../../../db/store';

export default function OperatorProfileTab({ staff, onLogout }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportDb = () => {
    try {
      const data = getState();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zero-waste-partner-db-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm('Reset all partner data back to the original factory seed state?')) {
      resetToSeed();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-stone-700">
              User Profile
            </span>
            <span className="text-xs font-mono text-[#1E7A46] font-bold">Active Shift</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold text-ink">
            Operator Settings & Profile
          </h1>
          <p className="text-xs text-ink-muted">
            Operator workstation identity, system preferences, and local database management
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition"
        >
          <LogOut size={15} />
          <span>Sign Out / Punch Out</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E7A46] text-white font-heading text-2xl font-bold shadow-md shadow-[#1E7A46]/20">
            {staff?.name
              ? staff.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()
              : 'PS'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-ink">{staff?.name || 'Pooja Sharma'}</h2>
              <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800 uppercase">
                {staff?.role || 'data_operator'}
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Staff ID: <span className="font-mono font-bold text-ink">{staff?.id || 'STF-003'}</span> • Mobile: {staff?.mobileNo || staff?.phone || '9801122336'}
            </p>
            <p className="text-xs text-ink-muted">
              Station: Sunai Central Desk, Patna • Lead Catalog Administrator
            </p>
          </div>
        </div>
      </div>

      {/* System Settings & Local Store Management */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Workspace Configuration */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Settings size={18} className="text-[#1E7A46]" />
            <h3 className="font-heading text-sm font-bold text-ink">Station Preferences</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-bold text-ink">Currency Standard</p>
                <p className="text-[11px] text-ink-muted">Default billing currency</p>
              </div>
              <span className="rounded-md bg-stone-100 px-2.5 py-1 font-mono font-bold text-ink">
                INR (₹)
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-stone-100">
              <div>
                <p className="font-bold text-ink">Weighing Units</p>
                <p className="text-[11px] text-ink-muted">Base certified metric</p>
              </div>
              <span className="rounded-md bg-stone-100 px-2.5 py-1 font-mono font-bold text-ink">
                Kilograms (kg)
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-stone-100">
              <div>
                <p className="font-bold text-ink">Audit Logging</p>
                <p className="text-[11px] text-ink-muted">Auto-record rate revisions</p>
              </div>
              <span className="rounded-md bg-emerald-100 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-800 uppercase">
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <HardDrive size={18} className="text-[#1E7A46]" />
            <h3 className="font-heading text-sm font-bold text-ink">Database Maintenance</h3>
          </div>

          <p className="text-xs text-ink-muted">
            All data is saved in your local station reactive storage (`sunai-partner-db-v1`).
          </p>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleExportDb}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-bold text-ink hover:bg-stone-100 transition"
            >
              <Download size={14} className="text-[#1E7A46]" />
              <span>Export Database Backup (JSON)</span>
            </button>
            {downloadSuccess && (
              <p className="text-center text-[11px] font-bold text-emerald-700">
                Database JSON exported successfully!
              </p>
            )}

            <button
              type="button"
              onClick={handleFactoryReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
            >
              <RotateCcw size={14} />
              <span>Reset Database to Factory Seed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Sign Out Footer */}
      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6 text-center space-y-2">
        <p className="font-heading text-sm font-bold text-ink">Finished your shift?</p>
        <p className="text-xs text-ink-muted">
          Punched in as Pooja Sharma (STF-003). Clock out to lock this workstation.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition"
          >
            <LogOut size={15} />
            <span>Punch Out Station</span>
          </button>
        </div>
      </div>
    </div>
  );
}
