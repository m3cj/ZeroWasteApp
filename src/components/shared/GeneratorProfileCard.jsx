import { Phone, MapPin, Scale, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import CategoryTag from './CategoryTag';
import { formatCurrency } from '../../utils/formatters';

/**
 * Standard Reusable Generator Profile Card
 * Used across Tickets, Purchase Kabaad, and Generator Directory.
 * Displays generator identity, category, contact, address, and live metrics:
 * - Lifetime KG
 * - Total Payout
 * - Outstanding Dues
 */
export default function GeneratorProfileCard({
  generator,
  onChange = null,
  compact = false,
  className = '',
}) {
  if (!generator) return null;

  const lifetimeKg = generator.lifetimeKG ?? generator.lifetimeKg ?? 0;
  const totalPayout = generator.totalPayout ?? generator.totalPayouts ?? 0;
  const dues = generator.outstandingDues ?? generator.dues ?? 0;

  return (
    <div
      className={`rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      {/* Header: Name, Category, ID, and Change Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
            {(generator.name || 'G')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading text-sm sm:text-base font-bold text-ink tracking-tight truncate">
                {generator.name || generator.ownerName || 'Waste Generator'}
              </h3>
              <CategoryTag category={generator.category} size="xs" />
            </div>
            <p className="font-mono text-[11px] text-stone-500 mt-0.5">
              ID: <span className="font-bold text-stone-700">{generator.id}</span>
            </p>
          </div>
        </div>

        {onChange && (
          <button
            type="button"
            onClick={onChange}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-mono text-xs font-bold text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition"
          >
            <RefreshCw size={12} className="text-stone-500" />
            <span>Change</span>
          </button>
        )}
      </div>

      {/* Contact & Address Row */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
        <div className="flex items-center gap-1.5 font-mono">
          <Phone size={13} className="text-stone-400 shrink-0" />
          <span className="font-medium">{generator.phone || 'No contact recorded'}</span>
        </div>
        <div className="flex items-start gap-1.5 min-w-0">
          <MapPin size={13} className="text-stone-400 shrink-0 mt-0.5" />
          <span className="truncate" title={generator.address}>
            {generator.address || 'Patna Municipal Area'}
          </span>
        </div>
      </div>

      {/* Industrial 3-Metric Strip: Lifetime KG, Total Payout, Outstanding Dues */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-3 font-mono">
        {/* Metric 1: Lifetime KG */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <Scale size={11} className="text-stone-400" />
            <span>Lifetime KG</span>
          </span>
          <p className="text-xs sm:text-sm font-bold text-ink">
            {lifetimeKg} <span className="text-[10px] text-stone-500 font-normal">kg</span>
          </p>
        </div>

        {/* Metric 2: Total Payout */}
        <div className="space-y-0.5 border-l border-stone-200/70 pl-2 sm:pl-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <Wallet size={11} className="text-emerald-700" />
            <span>Total Payout</span>
          </span>
          <p className="text-xs sm:text-sm font-bold text-emerald-800">
            {formatCurrency(totalPayout)}
          </p>
        </div>

        {/* Metric 3: Outstanding Dues */}
        <div className="space-y-0.5 border-l border-stone-200/70 pl-2 sm:pl-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <AlertCircle size={11} className={dues > 0 ? 'text-amber-700' : 'text-stone-400'} />
            <span>Outstanding</span>
          </span>
          <p className={`text-xs sm:text-sm font-bold ${dues > 0 ? 'text-amber-800' : 'text-stone-600'}`}>
            {formatCurrency(dues)}
          </p>
        </div>
      </div>
    </div>
  );
}
