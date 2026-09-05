import { Check, Home, PlusCircle, Sparkles } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import { formatCurrency } from '../../utils/formatters';

/**
 * Screen: Animated Confirmation Screen
 * Celebrates completed purchase with animated checkmark, transaction details, and clear actions.
 */
export default function StaffSuccessScreen({
  booking,
  onNewIntake,
  onGoHome,
}) {
  const items = booking?.items || [];
  const grandTotal = booking?.grandTotal || 0;
  const paymentMethod = (booking?.paymentMethod || 'cash').toUpperCase();
  const totalWeight = Math.round(
    items.reduce((sum, item) => sum + Number(item.weight || 0), 0) * 10
  ) / 10;

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      {/* 1. Animated Celebration Card */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/90 via-white to-white p-6 text-center shadow-sm">
        {/* Animated Checkmark Circle */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-pop">
            <Check size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="mt-3.5 space-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-3 py-0.5 font-mono text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
            <Sparkles size={11} className="text-emerald-700" />
            Purchase Completed
          </span>
          <h2 className="font-heading text-lg font-bold text-ink">
            Payment Issued Successfully
          </h2>
        </div>

        {/* Payout Amount Display */}
        <div className="mt-4 rounded-2xl border border-stone-200/80 bg-stone-50/80 p-3.5 space-y-0.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Total Payout Issued ({paymentMethod})
          </span>
          <p className="font-mono text-2xl font-extrabold text-emerald-800">
            {formatCurrency(grandTotal)}
          </p>
          <p className="font-mono text-xs text-stone-600">
            {totalWeight} kg scrap collected
          </p>
        </div>

        {/* Ticket Reference */}
        <div className="mt-2.5 flex items-center justify-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-stone-500">
            Reference:
          </span>
          <span className="font-mono text-xs font-bold text-[#2C5F74] bg-[#2C5F74]/10 rounded px-2 py-0.5 border border-[#2C5F74]/20">
            {booking?.id || 'TXN-2026-0001'}
          </span>
        </div>
      </div>

      {/* 2. Customer Summary Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="font-heading text-sm font-bold text-ink truncate">
              {booking?.name || booking?.ownerName || 'Customer'}
            </span>
            <CategoryTag category={booking?.category} size="xs" />
          </div>
          <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-[9px] font-bold text-stone-700 uppercase">
            Paid: {paymentMethod}
          </span>
        </div>

        {/* Items mini list */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 pt-2 space-y-1 text-xs font-mono">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-stone-600 text-[11px]">
                <span>
                  {item.name} ({item.weight} kg)
                </span>
                <span className="font-bold text-ink">
                  {formatCurrency(item.subtotal || item.amount || 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onNewIntake}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C5F74] py-3.5 px-4 text-xs font-bold text-white shadow-md shadow-[#2C5F74]/20 transition hover:bg-[#234d5e] active:scale-95"
        >
          <PlusCircle size={15} />
          <span>New Kabaad Purchase</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white py-3 text-xs font-semibold text-ink hover:bg-stone-50 active:scale-95 transition shadow-xs"
        >
          <Home size={15} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
