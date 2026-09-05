import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import VerifiedBadge from '../shared/VerifiedBadge';
import StickyBottomBar from '../shared/StickyBottomBar';
import { PAYMENT_META } from '../../constants';
import { formatCurrency } from '../../utils/formatters';

export default function ConfirmationScreen({
  generator,
  cart = [],
  grandTotal = 0,
  selectedPayment,
  setSelectedPayment,
  onBack,
  onConfirm,
}) {
  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-heading text-xl font-bold tracking-tight text-ink">
          Review & Pay
        </h2>
        <p className="text-xs text-ink-muted">
          Review transaction breakdown and select payment method.
        </p>
      </div>

      {/* Generator & Itemized Receipt */}
      <div className="receipt-card space-y-4">
        {/* Generator Line */}
        <div className="flex items-center justify-between border-b border-dashed border-stone-300 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Generator</p>
            <p className="font-heading text-base font-bold text-ink">{generator?.ownerName}</p>
          </div>
          <CategoryTag category={generator?.category} showIcon={true} size="xs" />
        </div>

        {/* Item Rows */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Purchased Dry Waste ({cart.length} items)
          </p>
          <div className="space-y-1.5 divide-y divide-stone-100">
            {cart.map((row, index) => (
              <div key={index} className="flex items-center justify-between pt-1.5 text-xs">
                <div>
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="font-mono text-[11px] text-ink-muted">
                    {row.weight} kg @ ₹{Number(row.pricePerUnit).toFixed(2)}/kg
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-ink">
                  {formatCurrency(row.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Total Sealed Ledger Stamp */}
        <div className="rounded-xl border-2 border-ledger/30 bg-ledger-soft p-4 text-center space-y-1 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-ledger">
            <ShieldCheck size={16} />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Verified Transaction Total
            </span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-ledger tracking-tight">
            {formatCurrency(grandTotal)}
          </div>
          <p className="text-[10px] font-mono text-ledger/80">Tamper-Proof Calculated</p>
        </div>
      </div>

      {/* Payment Method Selector Cards */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="mobile-label mb-0">Select Payment Method</label>
          <span className="text-[10px] font-bold text-stamp">* Required</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PAYMENT_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const isSelected = selectedPayment === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPayment(key)}
                className={`relative flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  isSelected
                    ? 'border-route bg-route-soft text-route shadow-sm ring-2 ring-route/20'
                    : 'border-stone-200 bg-stone-50/80 text-ink-light hover:border-stone-300 hover:bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-route text-white">
                    <CheckCircle2 size={12} />
                  </div>
                )}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-route text-white' : 'bg-white text-ink shadow-xs'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="mt-2 text-xs font-bold">{meta.label}</span>
                <span className="text-[9px] text-ink-muted truncate w-full mt-0.5">
                  {meta.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Confirmation Bar */}
      <StickyBottomBar>
        <div className="truncate mr-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Payment Mode
          </p>
          <p className="font-heading text-sm font-bold text-ink capitalize">
            {selectedPayment ? PAYMENT_META[selectedPayment]?.label : 'Select method'}
          </p>
        </div>

        <button
          onClick={onConfirm}
          disabled={!selectedPayment}
          className="btn-ledger w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider disabled:bg-stone-300 disabled:text-stone-500"
        >
          <span>Confirm & Record</span>
          <ArrowRight size={15} />
        </button>
      </StickyBottomBar>
    </div>
  );
}
