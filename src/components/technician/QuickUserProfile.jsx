import { useState } from 'react';
import {
  Clock,
  MapPin,
  Phone,
  CalendarDays,
  ArrowRight,
  Check,
  X,
  Scale,
  CalendarClock,
} from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import { formatCurrency } from '../../utils/formatters';

/**
 * QuickUserProfile Component
 * - Single top back button (handled in top shell)
 * - Complete detail of customer with 3 metrics: Total Kg, Payout, Dues
 * - "Pickup Slot" section with prominent "Schedule Slot" button
 * - No morning/afternoon/evening tags on slots, only date and time
 * - Primary action button: "Purchase Kabaad"
 */
export default function QuickUserProfile({
  ticket,
  slots = [],
  onUpdateSlot,
  onProceedToFlow2,
}) {
  const generator = ticket?.generator || {};
  const [selectedSlotId, setSelectedSlotId] = useState(
    ticket?.slotId || ticket?.slot?.id || slots[0]?.id || 'SLOT-01'
  );
  const [isChangingSlot, setIsChangingSlot] = useState(false);
  const [slotChangeNotice, setSlotChangeNotice] = useState('');

  const currentSlot =
    slots.find((s) => s.id === selectedSlotId) ||
    ticket?.slot ||
    slots[0] || {
      id: 'SLOT-01',
      day: 'Today',
      timeRange: '8:00 AM - 11:00 AM',
    };

  const handleSelectNewSlot = (slot) => {
    setSelectedSlotId(slot.id);
    if (onUpdateSlot && ticket?.id) {
      onUpdateSlot(ticket.id, slot.id);
    }
    setSlotChangeNotice(`Slot updated to ${slot.day} (${slot.timeRange || slot.timeWindow})`);
    setIsChangingSlot(false);
  };

  const handleContinueToFlow2 = () => {
    if (onProceedToFlow2) {
      onProceedToFlow2(ticket, currentSlot);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      {/* 1. User Profile Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <h2 className="font-heading text-base font-bold text-ink leading-snug truncate">
              {generator.name || generator.ownerName || 'Customer'}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryTag category={generator.category} size="xs" />
              {ticket?.id && (
                <span className="font-mono text-[9px] font-bold text-stone-600 bg-stone-100 rounded px-1.5 py-0.5 border border-stone-200/60">
                  {ticket.id}
                </span>
              )}
            </div>
          </div>

          {generator.phone && (
            <a
              href={`tel:${generator.phone}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 hover:bg-sky-100 transition active:scale-95 shadow-xs"
              title="Call Customer"
            >
              <Phone size={16} />
            </a>
          )}
        </div>

        {/* Contact & Address Details */}
        <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3 font-sans">
          {generator.phone && (
            <p className="flex items-center gap-2 font-mono text-[11px] text-stone-700">
              <Phone size={13} className="text-stone-400 shrink-0" />
              <span>{generator.phone}</span>
            </p>
          )}

          <p className="flex items-start gap-2 text-stone-700 text-[11px]">
            <MapPin size={13} className="text-stone-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{generator.address || 'Patna'}</span>
          </p>
        </div>

        {/* 3 Metrics: Total Kg, Payout, Dues */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center border-t border-stone-100 pt-3">
          <div className="rounded-xl bg-stone-50 p-2 border border-stone-200/60">
            <p className="text-[9px] uppercase tracking-wider text-stone-500 font-bold">Total Kg</p>
            <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">
              {generator.lifetimeKG ?? generator.lifetimeKg ?? 0} kg
            </p>
          </div>
          <div className="rounded-xl bg-stone-50 p-2 border border-stone-200/60">
            <p className="text-[9px] uppercase tracking-wider text-stone-500 font-bold">Payout</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-0.5">
              {formatCurrency(generator.totalPayout ?? generator.totalPayouts ?? 0)}
            </p>
          </div>
          <div className="rounded-xl bg-stone-50 p-2 border border-stone-200/60">
            <p className="text-[9px] uppercase tracking-wider text-stone-500 font-bold">Dues</p>
            <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
              {formatCurrency(generator.outstandingDues ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Pickup Slot Section (renamed from Assigned Pickup Slot) */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
              <CalendarDays size={15} />
            </div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
              Pickup Slot
            </h3>
          </div>

          {/* Schedule Slot prominent action button */}
          <button
            type="button"
            onClick={() => setIsChangingSlot(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#2C5F74] hover:bg-[#234d5e] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
          >
            <CalendarClock size={13} />
            <span>Schedule Slot</span>
          </button>
        </div>

        {/* Current Active Slot Display - ONLY date and time (no morning/afternoon/evening) */}
        <div className="rounded-xl border border-sky-200/70 bg-sky-50/50 p-3 flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-heading text-xs font-bold text-sky-950">
              {currentSlot.day}
              {currentSlot.formattedDate || currentSlot.date
                ? `, ${currentSlot.formattedDate || currentSlot.date}`
                : ''}
            </p>
            <p className="flex items-center gap-1.5 font-mono text-xs text-[#2C5F74] font-bold">
              <Clock size={12} />
              <span>{currentSlot.timeRange || currentSlot.timeWindow || '8:00 AM - 11:00 AM'}</span>
            </p>
          </div>

          {ticket?.estimatedWeight && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md">
              <Scale size={11} />
              <span>~{ticket.estimatedWeight} kg</span>
            </span>
          )}
        </div>

        {slotChangeNotice && (
          <p className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
            ✓ {slotChangeNotice}
          </p>
        )}
      </div>

      {/* 3. Action CTA: Purchase Kabaad */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleContinueToFlow2}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C5F74] py-3.5 px-4 text-xs font-bold text-white shadow-md shadow-[#2C5F74]/20 hover:bg-[#234d5e] active:scale-[0.985] transition"
        >
          <span>Purchase Kabaad</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 4. Schedule Slot Modal - Clean time windows without morning/afternoon labels */}
      {isChangingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl space-y-3.5 animate-scale-in border border-stone-100">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
                  <CalendarClock size={15} />
                </div>
                <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
                  Schedule Slot
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingSlot(false)}
                className="rounded-lg p-1 text-stone-400 hover:text-ink hover:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Select time slot for <strong>{generator.name || generator.ownerName}</strong>:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {slots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isAvailable = (slot.status || '').toLowerCase() !== 'full';

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectNewSlot(slot)}
                    className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#2C5F74] bg-sky-50/70 shadow-xs'
                        : isAvailable
                        ? 'border-stone-200 bg-stone-50/60 hover:bg-white hover:border-stone-300'
                        : 'border-stone-100 bg-stone-50 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <span className="font-heading text-xs font-bold text-ink">
                        {slot.day}, {slot.formattedDate || slot.date}
                      </span>
                      <p className="mt-0.5 font-mono text-[11px] text-[#2C5F74] font-semibold">
                        {slot.timeRange || slot.timeWindow}
                      </p>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        isSelected
                          ? 'border-[#2C5F74] bg-[#2C5F74] text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsChangingSlot(false)}
                className="w-full rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
