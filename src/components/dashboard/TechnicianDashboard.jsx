import { ArrowRight, ShoppingBag, ListChecks, LogOut, Truck, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Flow 2 - Step 0: Technician Role Dashboard
 * Minimal tile-based menu. Directs technician to 'Purchase Kabaad' (Flow 2)
 * or to the on-site ticket fulfillment queue.
 */
export default function TechnicianDashboard({
  staff,
  todayStats = { pending: 0, collectedKg: 0, paidOut: 0 },
  onSelectOption,
  onLogout,
}) {
  return (
    <div className="min-h-screen w-full bg-[#EAE8E1] py-6 px-4 flex justify-center items-start">
      <div className="relative flex min-h-[760px] w-full max-w-[420px] flex-col overflow-hidden rounded-[36px] border-[5px] border-stone-800 bg-[#FAF9F5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]">
        {/* Shift header */}
        <div className="bg-[#2C5F74] px-5 pb-5 pt-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/90 mb-1">
                Zero Waste Field Technician
              </span>
              <h1 className="font-heading text-lg font-bold">{staff?.name || 'Technician'}</h1>
              <p className="text-xs text-white/80">{staff?.zone || 'Field Operations'}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition text-white"
              title="Punch out"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Quick Shift Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-center">
            <div className="rounded-xl bg-white/10 px-2 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/60">Pending</p>
              <p className="text-base font-bold">{todayStats.pending}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-2 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/60">Collected</p>
              <p className="text-base font-bold">{todayStats.collectedKg} kg</p>
            </div>
            <div className="rounded-xl bg-white/10 px-2 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/60">Paid out</p>
              <p className="text-base font-bold">{formatCurrency(todayStats.paidOut)}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content & Action Tiles */}
        <div className="flex-1 p-5 space-y-4">
          <div className="border-b border-stone-200/80 pb-2">
            <h2 className="font-heading text-sm font-bold text-ink uppercase tracking-wider">
              Technician Workspace
            </h2>
            <p className="text-xs text-ink-muted">
              Select an operational action to begin.
            </p>
          </div>

          {/* Tile 1: Purchase Kabaad (Flow 2) */}
          <button
            type="button"
            onClick={() => onSelectOption('purchase')}
            className="group w-full text-left rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-sm hover:border-[#2C5F74] hover:shadow-md transition-all active:scale-[0.985]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2C5F74]/10 text-[#2C5F74] group-hover:bg-[#2C5F74] group-hover:text-white transition-colors">
                <ShoppingBag size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-ink group-hover:text-[#2C5F74] transition-colors">
                    Purchase Kabaad
                  </h3>
                  <span className="rounded-md bg-sky-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-800">
                    Flow 2
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted leading-snug">
                  Search customer desk, select intake mode, assign pickup slots, and dispatch booking orders.
                </p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 group-hover:bg-[#2C5F74]/15 group-hover:text-[#2C5F74] transition-colors mt-0.5">
                <ArrowRight size={16} />
              </div>
            </div>
          </button>

          {/* Tile 2: Fulfillment Queue & Weigh-In (Doorstep fulfillment) */}
          <button
            type="button"
            onClick={() => onSelectOption('queue')}
            className="group w-full text-left rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-sm hover:border-[#2C5F74] hover:shadow-md transition-all active:scale-[0.985]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <ListChecks size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald-800 transition-colors">
                    Doorstep Ticket Queue
                  </h3>
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
                    {todayStats.pending} Pending
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted leading-snug">
                  Fulfill dispatched tickets on-site with certified scales, record line items, and issue instant payouts.
                </p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors mt-0.5">
                <ArrowRight size={16} />
              </div>
            </div>
          </button>

          {/* Info note */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-100/60 p-3 text-[11px] text-ink-muted">
            <p className="flex items-center gap-1.5 font-semibold text-stone-700">
              <Truck size={13} className="text-[#2C5F74]" />
              <span>Partner Desk Sync: Online</span>
            </p>
            <p className="mt-0.5">
              Tickets booked in &apos;Purchase Kabaad&apos; instantly appear in the Doorstep Ticket Queue for on-site fulfillment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-white px-5 py-3 text-center">
          <p className="font-mono text-[10px] text-ink-faint">
            Sunai Partner Desk • Staff ID: {staff?.id || 'STF-001'}
          </p>
        </div>
      </div>
    </div>
  );
}
