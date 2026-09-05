import { CheckCircle2, ShieldCheck, ArrowRight, Home, Search, Receipt } from 'lucide-react';
import { PAYMENT_META } from '../../constants';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function SuccessScreen({
  generatorName,
  amount = 0,
  method = 'cash',
  transactionId = 'TXN-0001',
  timestamp,
  onNewSearch,
  onGoDashboard,
}) {
  const paymentInfo = PAYMENT_META[method] || PAYMENT_META.cash;
  const Icon = paymentInfo.icon;

  return (
    <div className="space-y-5 pb-10 pt-2 animate-fade-in text-center">
      {/* Animated Stamp Header */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ledger-soft text-ledger ring-8 ring-ledger/10 animate-pop">
        <CheckCircle2 size={44} strokeWidth={2.5} />
      </div>

      <div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ledger">
          <ShieldCheck size={14} />
          Ledger Entry Verified
        </span>
        <h2 className="font-heading text-2xl font-black tracking-tight text-ink mt-1">
          Transaction Recorded
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          The collection has been successfully committed to local ledger records.
        </p>
      </div>

      {/* Sealed Stamped Receipt Card */}
      <div className="receipt-card text-left space-y-3.5 mx-auto max-w-sm">
        <div className="flex items-center justify-between border-b border-dashed border-stone-300 pb-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Receipt ID</p>
            <p className="font-mono text-xs font-bold text-ink">{transactionId}</p>
          </div>
          <span className="font-mono text-[10px] text-ink-muted">
            {formatDateTime(timestamp || new Date().toISOString())}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-ink-muted">Waste Generator</span>
            <span className="font-bold text-ink">{generatorName || 'Generator'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-ink-muted">Payment Mode</span>
            <span className="inline-flex items-center gap-1 font-semibold text-ink">
              <Icon size={13} className="text-route" />
              {paymentInfo.label}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-stone-200 pt-2">
            <span className="font-bold text-ink">Total Amount Paid</span>
            <span className="font-mono text-lg font-black text-ledger">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2 max-w-sm mx-auto">
        <button
          onClick={onNewSearch}
          className="btn-primary shadow-lg shadow-route/20"
        >
          <Search size={16} />
          <span>New Generator Search</span>
        </button>

        <button
          onClick={onGoDashboard}
          className="btn-secondary"
        >
          <Home size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
