import { useState } from 'react';
import {
  Clock,
  Check,
  CalendarDays,
  Truck,
  ClipboardList,
  ArrowRight,
  Info,
} from 'lucide-react';
import KuraItemEntry from '../shared/KuraItemEntry';
import StickyBottomBar from '../shared/StickyBottomBar';

/**
 * Flow 1 - Page 2: Sell Kabaad Intake & Slot Booking Screen (Role: Zero Waste User)
 * - MAIN component: Predefined slots for kabaad pickup displayed prominently.
 * - Kabaad Entry: By default in clean 'At Pickup' mode (no confusing fields shown).
 *   Can be toggled to add items if approximate weight is known.
 * - Proceed button advances to Page 3 (Review & Confirmation).
 */
export default function KabadEntryScreen({
  kabadData,
  setKabadData,
  masterItems = [],
  masterSlots = [],
  onProceedToSlot,
  onBack,
}) {
  // 'pickup' (At Pickup - default) vs 'manual' (Know approx items)
  const [entryMode, setEntryMode] = useState(kabadData.entryMode || 'pickup');

  // Selected slot state (defaults to first available slot)
  const [selectedSlotId, setSelectedSlotId] = useState(
    kabadData.selectedSlotId || masterSlots[0]?.id || 'SLOT-01'
  );

  const activeSlot =
    masterSlots.find((s) => s.id === selectedSlotId) ||
    masterSlots[0] || {
      id: 'SLOT-01',
      day: 'Thursday',
      date: '2026-08-28',
      formattedDate: '28 Aug 2026',
      timeRange: '8:00 AM - 11:00 AM',
      slotName: 'Morning Slot',
    };

  const handleAddItem = (itemRow) => {
    setKabadData((prev) => ({
      ...prev,
      items: [...(prev.items || []), itemRow],
    }));
  };

  const handleRemoveItem = (index) => {
    setKabadData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== index),
    }));
  };

  const cartGrandTotal = (kabadData.items || []).reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  const handleProceed = () => {
    setKabadData((prev) => ({
      ...prev,
      entryMode: entryMode === 'manual' ? 'manual' : 'pickup',
      selectedSlotId: activeSlot.id,
      slotDay: activeSlot.day,
      slotDate: activeSlot.date,
      formattedDate: activeSlot.formattedDate,
      slotTime: `${activeSlot.slotName} (${activeSlot.timeRange})`,
      timeRange: activeSlot.timeRange,
      slotName: activeSlot.slotName,
      grandTotal: entryMode === 'pickup' ? 0 : cartGrandTotal,
    }));
    onProceedToSlot();
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Header */}
      <div>
        <h2 className="font-heading text-lg font-bold text-ink">
          Schedule Kabaad Pickup
        </h2>
        <p className="text-xs text-ink-muted">
          Choose your pickup slot and confirm doorstep collection.
        </p>
      </div>

      {/* 2. MAIN COMPONENT: Predefined Pickup Slots */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <CalendarDays size={15} />
            </div>
            <div>
              <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
                Available Pickup Slots
              </h3>
              <p className="text-[10px] text-ink-muted">
                Predefined slots for technician visit
              </p>
            </div>
          </div>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-200">
            Select One
          </span>
        </div>

        <div className="space-y-2 pt-0.5">
          {masterSlots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isAvailable = slot.status !== 'Full';

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`w-full text-left rounded-xl p-3 border-2 transition-all flex items-center justify-between active:scale-[0.99] ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/70 shadow-xs'
                    : isAvailable
                    ? 'border-stone-200 bg-white hover:border-stone-300'
                    : 'border-stone-100 bg-stone-50 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <Clock size={16} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-xs font-bold text-ink">
                        {slot.day}, {slot.formattedDate || slot.date}
                      </span>
                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ink-muted">
                        {slot.slotName}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-emerald-800 font-semibold">
                      {slot.timeRange}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. KABAAD ITEM ENTRY SECTION (Default Inactive / Doorstep Weighing) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
              Kabaad Items (Optional)
            </h3>
            <p className="text-[10px] text-ink-muted">
              Choose how you want your kabaad to be recorded
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEntryMode('pickup')}
            className={`flex items-center gap-2 rounded-xl p-2.5 border-2 text-left transition ${
              entryMode === 'pickup'
                ? 'border-emerald-700 bg-emerald-50/70 font-bold text-emerald-900 shadow-xs'
                : 'border-stone-200 bg-stone-50/60 text-ink-muted hover:border-stone-300'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                entryMode === 'pickup' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              <Truck size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Weigh at Pickup</p>
              <p className="text-[10px] font-normal text-stone-500 truncate">Default mode</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`flex items-center gap-2 rounded-xl p-2.5 border-2 text-left transition ${
              entryMode === 'manual'
                ? 'border-emerald-700 bg-emerald-50/70 font-bold text-emerald-900 shadow-xs'
                : 'border-stone-200 bg-stone-50/60 text-ink-muted hover:border-stone-300'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                entryMode === 'manual' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              <ClipboardList size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Add Items Now</p>
              <p className="text-[10px] font-normal text-stone-500 truncate">If quantity known</p>
            </div>
          </button>
        </div>

        {/* Content depending on selected mode */}
        {entryMode === 'pickup' ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-emerald-900">
              <Info size={14} />
              <span className="font-heading text-xs font-bold">Doorstep Weighing Guaranteed</span>
            </div>
            <p className="text-stone-700 font-medium leading-relaxed">
              You do not need to list any items now. The Zero Waste Technician will weigh all kabaad at your doorstep using a certified digital scale.
            </p>
            <p className="text-stone-600 font-sans text-[11px]">
              सामान का वजन और प्रविष्टि जीरो वेस्ट तकनीशियन द्वारा आपके स्थान पर पहुंचने पर की जाएगी।
            </p>
          </div>
        ) : (
          <div className="pt-1 animate-fade-in">
            <KuraItemEntry
              masterItems={masterItems}
              items={kabadData.items || []}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        )}
      </div>

      {/* 4. Sticky Bottom Bar */}
      <StickyBottomBar>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:bg-stone-50 active:scale-95"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 active:scale-95"
          >
            <span>Proceed to Review & Confirm</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </StickyBottomBar>
    </div>
  );
}
