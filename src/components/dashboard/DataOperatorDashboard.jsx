import { ArrowRight, Sliders, LogOut, Database, Layers, TrendingUp, CalendarDays, Users } from 'lucide-react';

/**
 * Flow 3 - Step 0: Data Operator Role Dashboard
 * Minimal tile-based menu. Directs operator to 'Master Control Panel' (Flow 3)
 */
export default function DataOperatorDashboard({
  staff,
  stats = { itemsCount: 0, slotsCount: 0, generatorsCount: 0, auditCount: 0 },
  onSelectOption,
  onLogout,
}) {
  return (
    <div className="min-h-screen w-full bg-[#EAE8E1] py-8 px-4 flex justify-center items-start">
      <div className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-stone-300 bg-[#FAF9F5] shadow-2xl">
        {/* Header bar */}
        <div className="border-b border-stone-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                  Data Operator Desk
                </span>
                <span className="text-xs font-mono text-ink-muted">· {staff?.id || 'STF-003'}</span>
              </div>
              <h1 className="mt-1 font-heading text-2xl font-bold text-ink">
                {staff?.name || 'Operator Console'}
              </h1>
              <p className="text-xs text-ink-muted">
                {staff?.zone || 'Sunai Central Partner Desk'} • Master Rate & Taxonomy Management
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-bold text-ink hover:bg-stone-100 transition active:scale-95"
            >
              <LogOut size={14} />
              <span>Punch out</span>
            </button>
          </div>

          {/* Quick Database Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5">
              <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold">
                <TrendingUp size={14} />
                <span>Master Items</span>
              </div>
              <p className="mt-1.5 text-2xl font-bold text-ink">{stats.itemsCount}</p>
              <p className="text-[10px] text-ink-muted">Live buy rates active</p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5">
              <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold">
                <Users size={14} />
                <span>Registered Generators</span>
              </div>
              <p className="mt-1.5 text-2xl font-bold text-ink">{stats.generatorsCount}</p>
              <p className="text-[10px] text-ink-muted">Family / Biz / Public</p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5">
              <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold">
                <CalendarDays size={14} />
                <span>Pickup Windows</span>
              </div>
              <p className="mt-1.5 text-2xl font-bold text-ink">{stats.slotsCount}</p>
              <p className="text-[10px] text-ink-muted">Active master slots</p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5">
              <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold">
                <Database size={14} />
                <span>Price Audits</span>
              </div>
              <p className="mt-1.5 text-2xl font-bold text-ink">{stats.auditCount}</p>
              <p className="text-[10px] text-ink-muted">Logged revision events</p>
            </div>
          </div>
        </div>

        {/* Dashboard Menu / Tiles */}
        <div className="p-8 space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="font-heading text-sm font-bold text-ink uppercase tracking-wider">
              Operator Menu Options
            </h2>
            <p className="text-xs text-ink-muted">
              Select module to manage live rates, catalog taxonomy, and scheduling.
            </p>
          </div>

          {/* Tile 1: Master Control Panel (Locked Flow 3) */}
          <button
            type="button"
            onClick={() => onSelectOption('control_panel')}
            className="group w-full text-left rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-xs hover:border-indigo-600 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                <Sliders size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-ink group-hover:text-indigo-800 transition-colors">
                    Master Control Panel
                  </h3>
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800">
                    Flow 3
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed max-w-2xl">
                  Full 4-tab control console: Inline price revisions, percentage bulk deltas with audit log, scrap catalog add/remove, generator category classification, and master pickup slots dispatch schedule.
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-stone-600">
                  <span className="rounded-lg bg-stone-100 px-2.5 py-1">1. Live Rates</span>
                  <span className="rounded-lg bg-stone-100 px-2.5 py-1">2. Waste Catalog</span>
                  <span className="rounded-lg bg-stone-100 px-2.5 py-1">3. Generator Taxonomy</span>
                  <span className="rounded-lg bg-stone-100 px-2.5 py-1">4. Pickup Slots</span>
                </div>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 group-hover:bg-indigo-100 group-hover:text-indigo-800 transition-colors mt-1">
                <ArrowRight size={18} />
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-white px-8 py-3 text-center">
          <p className="font-mono text-[11px] text-ink-faint">
            Sunai Partner Database • client-side normalized store (v1)
          </p>
        </div>
      </div>
    </div>
  );
}
