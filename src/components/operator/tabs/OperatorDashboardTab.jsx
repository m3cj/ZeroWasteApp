import {
  TrendingUp,
  Users,
  CalendarDays,
  ArrowRight,
  ClipboardList,
  Layers,
  Building2,
  Clock,
  CheckCircle2,
  Tag,
  PlusCircle,
  Truck,
  ShoppingBag,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import CategoryTag from '../../shared/CategoryTag';
import WasteIcon from '../../shared/WasteIcon';

export default function OperatorDashboardTab({
  db,
  enrichedItems = [],
  enrichedSlots = [],
  ticketsWithDetails = [],
  onNavigateTab,
}) {
  const pendingTickets = ticketsWithDetails.filter((t) => t.status !== 'completed');
  const completedTickets = ticketsWithDetails.filter((t) => t.status === 'completed');

  // Generators breakdown
  const familyCount = (db.generators || []).filter((g) => g.category === 'family').length;
  const businessCount = (db.generators || []).filter((g) => g.category === 'business').length;
  const publicCount = (db.generators || []).filter((g) => g.category === 'public').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <h1 className="font-heading text-xl font-bold text-ink tracking-tight">
            Dashboard
          </h1>
          <p className="font-mono text-xs text-stone-500 mt-0.5">
            Patna Central Hub • {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateTab('tickets', 'new-ticket')}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition"
          >
            <PlusCircle size={14} />
            <span>New Pickup Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('purchase')}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-ink hover:bg-stone-100 active:scale-95 transition"
          >
            <ShoppingBag size={14} className="text-primary" />
            <span>Purchase Kabaad</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
        {/* Card 1: Tickets */}
        <div
          onClick={() => onNavigateTab('tickets', 'all')}
          className="group cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-primary hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-sans font-bold">Pickup Tickets</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700 group-hover:bg-primary group-hover:text-white transition">
              <ClipboardList size={14} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{ticketsWithDetails.length}</p>
          <div className="mt-2 flex items-center justify-between font-sans text-xs">
            <span className="text-amber-800 font-semibold">{pendingTickets.length} Pending</span>
            <span className="text-emerald-800 font-semibold">{completedTickets.length} Done</span>
          </div>
        </div>

        {/* Card 2: Kabaad Catalogue */}
        <div
          onClick={() => onNavigateTab('catalogue')}
          className="group cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-primary hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-sans font-bold">Kabaad Items</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-primary group-hover:text-white transition">
              <Layers size={14} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{enrichedItems.length}</p>
          <div className="mt-2 flex items-center justify-between font-sans text-xs text-stone-500">
            <span>5 Groups • 10 Cats</span>
            <span className="text-emerald-800 font-semibold">Active Rates</span>
          </div>
        </div>

        {/* Card 3: Waste Generators */}
        <div
          onClick={() => onNavigateTab('generators')}
          className="group cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-primary hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-sans font-bold">Waste Generators</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-primary group-hover:text-white transition">
              <Users size={14} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{(db.generators || []).length}</p>
          <div className="mt-2 flex items-center gap-1.5 font-sans text-xs text-stone-500">
            <span>{familyCount} Fam</span>
            <span>•</span>
            <span>{businessCount} Biz</span>
            <span>•</span>
            <span>{publicCount} Pub</span>
          </div>
        </div>

        {/* Card 4: Pickup Slots */}
        <div
          onClick={() => onNavigateTab('slots')}
          className="group cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-primary hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-sans font-bold">Dispatch Slots</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 group-hover:bg-primary group-hover:text-white transition">
              <CalendarDays size={14} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{enrichedSlots.length}</p>
          <div className="mt-2 flex items-center justify-between font-sans text-xs text-stone-500">
            <span>{enrichedSlots.filter((s) => (s.status || '').toLowerCase() === 'available').length} Available</span>
            <span className="text-stone-600 font-semibold">Open Fleet Pool</span>
          </div>
        </div>
      </div>

      {/* Detail Layout: Recent Tickets Table (2 cols) + Hub Status Overview (1 col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Pickup Tickets */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-heading text-sm font-bold text-ink">
              Recent Pickup Tickets
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('tickets', 'all')}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {ticketsWithDetails.slice(0, 5).map((ticket) => {
              const isCompleted = ticket.status === 'completed';
              return (
                <div
                  key={ticket.id}
                  onClick={() => onNavigateTab('tickets', 'all')}
                  className="flex items-center justify-between py-3 hover:bg-stone-50/70 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-ink bg-stone-100 px-2 py-1 rounded border border-stone-200/60">
                      {ticket.id}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-xs font-bold text-ink truncate">
                          {ticket.generator?.name || ticket.generator?.ownerName || 'Waste Generator'}
                        </p>
                        {ticket.generator?.category && (
                          <CategoryTag category={ticket.generator.category} size="xs" />
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-stone-500 truncate mt-0.5">
                        {ticket.slot?.formattedDate || ticket.slot?.date} •{' '}
                        {ticket.slot?.timeRange || ticket.slot?.timeWindow || '8:00 AM - 11:00 AM'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono shrink-0">
                    <span className="text-xs text-stone-500">
                      {ticket.estimateAtPickup || ticket.estimatedWeight === 0
                        ? 'Est. at pickup'
                        : `~${ticket.estimatedWeight || 15} kg`}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      <span>{ticket.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Material Groups & Dispatch Summary */}
        <div className="space-y-4">
          {/* Material Groups Breakdown */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-heading text-sm font-bold text-ink">
                Material Groups
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab('catalogue')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Catalog
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {[
                { name: 'Dry Waste', count: 68, icon: 'Boxes' },
                { name: 'E-Waste', count: 4, icon: 'Cpu' },
                { name: 'Domestic Hazardous Waste', count: 2, icon: 'AlertTriangle' },
              ].map((grp) => (
                <div
                  key={grp.name}
                  onClick={() => onNavigateTab('catalogue')}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 bg-stone-50/60 hover:bg-stone-100/80 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <WasteIcon token={grp.icon} size={15} className="text-primary" />
                    <span className="font-sans font-medium text-ink">{grp.name}</span>
                  </div>
                  <span className="font-bold text-stone-600">{grp.count} items</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet Dispatch Overview */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-2.5">
            <span className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Fleet & Technician Operations
            </span>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck size={18} />
              </div>
              <div>
                <p className="font-heading text-xs font-bold text-ink">Open Dispatch Pool</p>
                <p className="font-mono text-[10px] text-stone-500">Shared queue accessible to all active technicians</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
