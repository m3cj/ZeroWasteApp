import { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Info,
  X,
  Phone,
  MapPin,
  Scale,
  Wallet,
  AlertCircle,
  CalendarDays,
  CalendarClock,
  Clock,
  Check,
} from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import KuraItemEntry from '../shared/KuraItemEntry';
import { formatCurrency } from '../../utils/formatters';

/**
 * Screen: Purchase Kabaad / Kabaad Entry
 * - Title: Purchase Kabaad (or Kabaad Entry when no user is selected)
 * - User info: Only displayed if customer is selected, with high-contrast "Info" button
 * - Stag entry: When no customer is selected, no user info or profile badge is displayed
 * - Direct back button in header
 * - In-screen Proceed button
 */
export default function StaffItemEntryScreen({
  staffEntry,
  setStaffEntry,
  masterItems = [],
  wasteGroups = [],
  wasteCategories = [],
  slots = [],
  generators = [],
  onUpdateSlot,
  onProceedToSlot,
  onBack,
}) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isChangingSlot, setIsChangingSlot] = useState(false);
  const [slotChangeNotice, setSlotChangeNotice] = useState('');

  const items = staffEntry.items || [];

  // Lookup full generator object if available
  const generator = useMemo(() => {
    if (staffEntry.generator) return staffEntry.generator;
    if (staffEntry.generatorId && generators.length > 0) {
      return generators.find((g) => g.id === staffEntry.generatorId) || staffEntry;
    }
    return staffEntry;
  }, [staffEntry, generators]);

  // Current slot computation
  const currentSlot = useMemo(() => {
    if (staffEntry.selectedSlotId && slots.length > 0) {
      return slots.find((s) => s.id === staffEntry.selectedSlotId) || null;
    }
    if (staffEntry.ticket?.slot) return staffEntry.ticket.slot;
    return null;
  }, [staffEntry.selectedSlotId, staffEntry.ticket, slots]);

  const handleAddItem = (itemRow) => {
    setStaffEntry((prev) => ({
      ...prev,
      items: [...(prev.items || []), itemRow],
    }));
  };

  const handleRemoveItem = (index) => {
    setStaffEntry((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== index),
    }));
  };

  const cartGrandTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  }, [items]);

  const totalKg = useMemo(() => {
    return Math.round(items.reduce((sum, item) => sum + Number(item.weight || 0), 0) * 10) / 10;
  }, [items]);

  const handleProceed = () => {
    if (items.length === 0) return;
    setStaffEntry((prev) => ({
      ...prev,
      entryMode: 'manual',
      grandTotal: cartGrandTotal,
    }));
    onProceedToSlot();
  };

  const handleSelectNewSlot = (slot) => {
    if (!slot) {
      setStaffEntry((prev) => ({
        ...prev,
        selectedSlotId: null,
        slotDay: null,
        slotTime: null,
        timeRange: null,
      }));
      if (onUpdateSlot && staffEntry.ticketId) {
        onUpdateSlot(staffEntry.ticketId, null);
      }
      setSlotChangeNotice('Pickup slot cleared (No Slots)');
      setIsChangingSlot(false);
      return;
    }

    setStaffEntry((prev) => ({
      ...prev,
      selectedSlotId: slot.id,
      slotDay: slot.day,
      slotTime: slot.timeRange || slot.timeWindow,
      timeRange: slot.timeRange || slot.timeWindow,
    }));
    if (onUpdateSlot && staffEntry.ticketId) {
      onUpdateSlot(staffEntry.ticketId, slot.id);
    }
    setSlotChangeNotice(`Slot updated to ${slot.day} (${slot.timeRange || slot.timeWindow})`);
    setIsChangingSlot(false);
  };

  const lifetimeKg = generator.lifetimeKG ?? generator.lifetimeKg ?? 0;
  const totalPayout = generator.totalPayout ?? generator.totalPayouts ?? 0;
  const dues = generator.outstandingDues ?? generator.dues ?? 0;

  const hasUser = Boolean(staffEntry.name || staffEntry.generatorId || staffEntry.generator);

  return (
    <div className="space-y-3 pb-6 animate-fade-in">
      {/* 1. Title Header with In-Screen Back Button */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-200/70 hover:bg-stone-300 text-stone-700 active:scale-95 transition shrink-0"
            title="Back to Waste Generator Desk"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <h2 className="font-heading text-lg font-bold text-ink tracking-tight">
            {hasUser ? 'Purchase Kabaad' : 'Kabaad Entry'}
          </h2>
        </div>
      </div>

      {/* 2. Top User Profile Badge: ONLY rendered if a user is selected (hidden for stag entry) */}
      {hasUser && (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-heading text-sm font-bold text-ink truncate">
                {staffEntry.name || staffEntry.ownerName || 'Customer'}
              </span>
              {staffEntry.category && <CategoryTag category={staffEntry.category} size="xs" />}
            </div>

            {/* High Contrast Info Button */}
            <button
              type="button"
              onClick={() => setIsInfoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-black text-white px-3 py-1.5 font-heading text-xs font-bold shadow-xs active:scale-95 transition shrink-0"
              title="Customer Info & Pickup Slot"
            >
              <Info size={13} className="text-amber-400" />
              <span>Info</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Kabaad Item Form starts immediately */}
      <KuraItemEntry
        masterItems={masterItems}
        wasteGroups={wasteGroups}
        wasteCategories={wasteCategories}
        items={items}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />

      {/* 4. In-screen Proceed Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={items.length === 0}
          onClick={handleProceed}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-bold transition shadow-sm ${
            items.length > 0
              ? 'bg-[#2C5F74] text-white hover:bg-[#234d5e] active:scale-[0.985] shadow-[#2C5F74]/20 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <span>Review & Pay</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 5. Quick Profile Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl space-y-3.5 animate-scale-in border border-stone-100 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-amber-400">
                  <Info size={15} />
                </div>
                <h3 className="font-heading text-sm font-bold text-ink">
                  Customer Profile & Slot
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsInfoModalOpen(false);
                  setIsChangingSlot(false);
                }}
                className="rounded-lg p-1 text-stone-400 hover:text-ink hover:bg-stone-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Customer Details Card */}
            <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold text-ink truncate">
                    {generator.name || generator.ownerName || 'Customer'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CategoryTag category={generator.category} size="xs" />
                    {generator.id && (
                      <span className="font-mono text-[9px] font-bold text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        {generator.id}
                      </span>
                    )}
                  </div>
                </div>

                {generator.phone && (
                  <a
                    href={`tel:${generator.phone}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition shadow-xs"
                    title="Call Customer"
                  >
                    <Phone size={14} />
                  </a>
                )}
              </div>

              {generator.address && (
                <p className="flex items-start gap-1.5 text-stone-600 text-[11px] pt-1 border-t border-stone-200/60">
                  <MapPin size={12} className="text-stone-400 shrink-0 mt-0.5" />
                  <span className="truncate">{generator.address}</span>
                </p>
              )}

              {/* 3 Metrics: Lifetime KG, Total Payout, Outstanding Dues */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200/70 bg-white p-2.5 font-mono text-center">
                <div>
                  <span className="text-[9px] font-bold uppercase text-stone-400 block">
                    Lifetime KG
                  </span>
                  <span className="text-xs font-bold text-ink mt-0.5 block">
                    {lifetimeKg} kg
                  </span>
                </div>
                <div className="border-l border-stone-100">
                  <span className="text-[9px] font-bold uppercase text-stone-400 block">
                    Total Payout
                  </span>
                  <span className="text-xs font-bold text-emerald-800 mt-0.5 block">
                    {formatCurrency(totalPayout)}
                  </span>
                </div>
                <div className="border-l border-stone-100">
                  <span className="text-[9px] font-bold uppercase text-stone-400 block">
                    Dues
                  </span>
                  <span
                    className={`text-xs font-bold mt-0.5 block ${
                      dues > 0 ? 'text-amber-800' : 'text-stone-600'
                    }`}
                  >
                    {formatCurrency(dues)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup Slot Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[#2C5F74]" />
                  <span className="font-heading text-xs font-bold text-ink">
                    Pickup Slot
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChangingSlot(!isChangingSlot)}
                  className="flex items-center gap-1 rounded-xl bg-[#2C5F74] hover:bg-[#234d5e] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition active:scale-95"
                >
                  <CalendarClock size={12} />
                  <span>{currentSlot ? 'Change Slot' : 'Schedule Slot'}</span>
                </button>
              </div>

              {/* Slot Display or No Slots */}
              {currentSlot ? (
                <div className="rounded-xl border border-sky-200/70 bg-sky-50/50 p-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-heading text-xs font-bold text-sky-950">
                      {currentSlot.day}
                      {currentSlot.formattedDate || currentSlot.date
                        ? `, ${currentSlot.formattedDate || currentSlot.date}`
                        : ''}
                    </p>
                    <p className="flex items-center gap-1 font-mono text-[11px] text-[#2C5F74] font-bold">
                      <Clock size={11} />
                      <span>{currentSlot.timeRange || currentSlot.timeWindow || '8:00 AM - 11:00 AM'}</span>
                    </p>
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded">
                    Scheduled
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/80 p-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-heading text-xs font-bold text-stone-700 flex items-center gap-1">
                      <CalendarClock size={13} className="text-stone-400" />
                      <span>No Slots</span>
                    </p>
                    <p className="font-mono text-[10px] text-stone-400">
                      No pickup slot selected for this user
                    </p>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                    Unscheduled
                  </span>
                </div>
              )}

              {slotChangeNotice && (
                <p className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-lg">
                  ✓ {slotChangeNotice}
                </p>
              )}

              {/* Inline Slot Selector when changing slot */}
              {isChangingSlot && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-2.5 space-y-1.5 animate-scale-in">
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-500 block">
                    Choose Pickup Window:
                  </span>

                  {/* Option: Clear / No Slot */}
                  <button
                    type="button"
                    onClick={() => handleSelectNewSlot(null)}
                    className={`w-full text-left rounded-xl p-2 border transition flex items-center justify-between ${
                      !staffEntry.selectedSlotId
                        ? 'border-[#2C5F74] bg-sky-50 font-bold'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <span className="font-heading text-xs font-bold text-stone-700">
                        No Slots (Unscheduled)
                      </span>
                      <p className="text-[10px] text-stone-400">Keep ticket unscheduled</p>
                    </div>
                    {!staffEntry.selectedSlotId && <Check size={13} className="text-[#2C5F74]" />}
                  </button>

                  {/* Available Slots */}
                  {slots.map((slot) => {
                    const isSelected = staffEntry.selectedSlotId === slot.id;
                    const isAvailable = (slot.status || '').toLowerCase() !== 'full';
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleSelectNewSlot(slot)}
                        className={`w-full text-left rounded-xl p-2 border transition flex items-center justify-between ${
                          isSelected
                            ? 'border-[#2C5F74] bg-sky-50 font-bold'
                            : isAvailable
                            ? 'border-stone-200 bg-white hover:bg-stone-50'
                            : 'border-stone-100 bg-stone-100 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <span className="font-heading text-xs font-bold text-ink">
                            {slot.day}, {slot.formattedDate || slot.date}
                          </span>
                          <p className="text-[10px] font-mono text-[#2C5F74]">
                            {slot.timeRange || slot.timeWindow}
                          </p>
                        </div>
                        {isSelected && <Check size={13} className="text-[#2C5F74]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Done Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsInfoModalOpen(false);
                  setIsChangingSlot(false);
                }}
                className="w-full rounded-xl bg-stone-900 hover:bg-black text-white py-2.5 text-xs font-bold transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
