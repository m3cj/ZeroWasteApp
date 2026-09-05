import { useState } from 'react';
import { Calendar, CheckCircle2, Check, Clock, CalendarDays } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import { formatDate, formatPhone } from '../../utils/formatters';

export default function VisitConfirmationScreen({
  form,
  routeSchedule = [],
  masterSlots = [],
  communities = [],
  onBack,
  onDone,
}) {
  const activeCommunity =
    communities.find((c) => c.id === form.communityId) || communities[0];

  const scheduleEntry =
    routeSchedule.find(
      (entry) => entry.communityId === form.communityId || entry.ward?.includes(activeCommunity?.name)
    ) || routeSchedule[0];

  // Default to selecting the first available master slot
  const [selectedSlotIds, setSelectedSlotIds] = useState(
    form.preferredSlotIds || [masterSlots[0]?.id || 'SLOT-01']
  );

  const handleToggleSlot = (slotId) => {
    setSelectedSlotIds((prev) => {
      if (prev.includes(slotId)) {
        if (prev.length === 1) return prev; // Keep at least one slot
        return prev.filter((id) => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  const handleComplete = () => {
    const fullAddress = `${form.addressLine || ''}${form.area ? `, ${form.area}` : ''}, ${form.city || 'Patna'} - ${form.pincode || '800020'}`;

    const chosenSlots = masterSlots
      .filter((s) => selectedSlotIds.includes(s.id))
      .map((s) => `${s.day}, ${s.formattedDate || s.date} • ${s.timeRange}`);

    const completeRecord = {
      communityId: form.communityId || activeCommunity?.id || 'COM-001',
      communityName: activeCommunity?.name || 'Kankarbagh',
      category: form.category || 'family',
      name: form.name || 'Citizen',
      ownerName: form.name || 'Citizen',
      phone: form.phone || '',
      addressLine: form.addressLine || '',
      area: form.area || '',
      pincode: form.pincode || '800020',
      city: form.city || 'Patna',
      address: fullAddress,
      kabadiAttached: Boolean(form.kabadiAttached),
      kabadiNotes: form.kabadiAttached ? form.kabadiNotes || '' : '',
      preferredSlots: chosenSlots,
      preferredSlotIds: selectedSlotIds,
      specialOrderRemarks: form.hasSpecialOrder ? form.specialOrderRemarks || '' : '',
      lastTransactionDate: null,
      outstandingDues: 0,
      nextVisitDate: scheduleEntry?.nextVisitDate || null,
    };

    onDone(completeRecord);
  };

  return (
    <div className="space-y-3.5 pb-12 animate-fade-in">
      {/* 1. Next Scheduled Visit Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-route">
            Route Schedule
          </span>
          <span className="text-xs font-semibold text-ink-muted">
            {activeCommunity?.name}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-route text-white">
            <Calendar size={20} />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-ink">
              {scheduleEntry ? formatDate(scheduleEntry.nextVisitDate) : 'August 28, 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Predefined Master Slots List (Fixed Days & Timings Managed by Data Operator) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <CalendarDays size={14} className="text-route" />
            <span>Select Preferred Available Slot(s)</span>
          </span>
          <span className="text-[10px] font-mono text-ink-muted">Fixed Schedule</span>
        </div>

        <div className="space-y-2 pt-1">
          {masterSlots.map((slot) => {
            const isSelected = selectedSlotIds.includes(slot.id);
            const isAvailable = slot.status !== 'Full';

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleToggleSlot(slot.id)}
                className={`w-full text-left rounded-xl p-3 border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-route bg-route-soft/70 shadow-sm'
                    : isAvailable
                    ? 'border-stone-200 bg-stone-50/60 hover:bg-white'
                    : 'border-stone-100 bg-stone-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                      isSelected
                        ? 'bg-route text-white'
                        : 'bg-stone-200/80 text-stone-700'
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
                    <p className="mt-0.5 font-mono text-[11px] text-route font-semibold">
                      ⏰ {slot.timeRange}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    isSelected ? 'border-route bg-route text-white' : 'border-stone-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Citizen Summary Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-ink">{form.name}</span>
          <CategoryTag category={form.category || 'family'} showIcon={false} size="xs" />
        </div>

        <div className="text-ink-muted space-y-1 pt-1 border-t border-stone-100">
          <p className="font-mono">{formatPhone(form.phone)}</p>
          <p>{form.addressLine}{form.area ? `, ${form.area}` : ''}, {activeCommunity?.name}</p>
          {form.kabadiAttached && (
            <p className="text-amber-800 font-medium">Kabaad: {form.kabadiNotes || 'Yes'}</p>
          )}
          {form.hasSpecialOrder && form.specialOrderRemarks && (
            <p className="text-route font-medium">Special Order: {form.specialOrderRemarks}</p>
          )}
        </div>
      </div>

      {/* 4. Complete Action */}
      <div>
        <button
          onClick={handleComplete}
          className="btn-ledger flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={16} />
          <span>Confirm & Register Lead</span>
        </button>
      </div>
    </div>
  );
}
