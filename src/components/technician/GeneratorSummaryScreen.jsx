import { MapPin, Phone, Calendar, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Clock, FileText, Store } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import VerifiedBadge from '../shared/VerifiedBadge';
import { formatDate, formatCurrency, formatPhone } from '../../utils/formatters';

export default function GeneratorSummaryScreen({
  generator,
  onStartPurchase,
  onBack,
}) {
  if (!generator) return null;

  const dues = Number(generator.outstandingDues || 0);
  const hasDues = dues > 0;

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-heading text-xl font-bold tracking-tight text-ink">
          Generator Profile
        </h2>
        <p className="text-xs text-ink-muted">
          Review generator status before recording dry waste purchase.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-card space-y-4">
        {/* Top Info */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-ink-muted">
                {generator.id}
              </span>
              <CategoryTag category={generator.category} showIcon={true} size="xs" />
            </div>
            <h3 className="font-heading text-xl font-bold text-ink mt-1">
              {generator.name || generator.ownerName}
            </h3>
            {generator.communityName && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-route bg-route-soft px-2 py-0.5 rounded-md">
                <MapPin size={11} />
                {generator.communityName}
              </span>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ledger-soft text-ledger">
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5 rounded-xl bg-stone-50/80 p-3.5 text-xs text-ink-light divide-y divide-stone-200/60">
          {/* Address */}
          <div className="flex items-start gap-2.5 pb-2">
            <MapPin size={15} className="shrink-0 text-stone-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Address</p>
              <p className="font-medium text-ink">{generator.address}</p>
              {generator.area && (
                <p className="text-[11px] text-ink-muted mt-0.5">Area: {generator.area} • PIN {generator.pincode || '800020'}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-2.5 pt-2">
            <Phone size={15} className="shrink-0 text-stone-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Contact Number</p>
              <p className="font-mono font-medium text-ink">{formatPhone(generator.phone)}</p>
            </div>
          </div>

          {/* Last Collection */}
          <div className="flex items-start gap-2.5 pt-2">
            <Calendar size={15} className="shrink-0 text-stone-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Last Collection</p>
              <p className="font-medium text-ink">{formatDate(generator.lastTransactionDate)}</p>
            </div>
          </div>

          {/* Preferred Time Slots if set */}
          {generator.preferredSlots && generator.preferredSlots.length > 0 && (
            <div className="flex items-start gap-2.5 pt-2">
              <Clock size={15} className="shrink-0 text-stone-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Preferred Pickup Slot</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {generator.preferredSlots.map((slot, i) => (
                    <span key={i} className="rounded bg-stone-200/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-ink">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kabaad Info if attached */}
          {(generator.kabadiAttached || generator.kabaadAttached) && (
            <div className="flex items-start gap-2.5 pt-2">
              <Store size={15} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Local Kabaad Dealer Attached</p>
                <p className="font-medium text-ink text-[11px]">{generator.kabaadNotes || generator.kabadiNotes || 'Associated with local scrap dealer'}</p>
              </div>
            </div>
          )}

          {/* Special Order Remarks */}
          {generator.specialOrderRemarks && (
            <div className="flex items-start gap-2.5 pt-2">
              <FileText size={15} className="shrink-0 text-route mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-route">Special Order / Waste Remarks</p>
                <p className="font-medium text-ink text-[11px] bg-route-soft/60 p-2 rounded-lg mt-0.5 border border-route/15">
                  {generator.specialOrderRemarks}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dues Status Banner */}
        {hasDues ? (
          <div className="flex items-center justify-between rounded-xl border border-stamp/30 bg-stamp-soft p-3 text-xs text-stamp">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-stamp" />
              <div>
                <p className="font-bold">Outstanding Dues Pending</p>
                <p className="text-[11px] text-stamp/80">Pending from previous transaction</p>
              </div>
            </div>
            <span className="font-mono text-base font-bold text-stamp">
              {formatCurrency(dues)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-ledger/20 bg-ledger-soft p-3 text-xs text-ledger">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0 text-ledger" />
              <span className="font-semibold">All Accounts Settled</span>
            </div>
            <span className="font-mono text-xs font-bold text-ledger">₹0.00</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <button
          onClick={onStartPurchase}
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-route/20"
        >
          <span>Start Dry Waste Purchase</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
