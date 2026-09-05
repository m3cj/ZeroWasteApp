import { CheckCircle2, Home, PlusCircle, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Flow 1 - Page 3: Confirmation Screen / Request Receipt (Role: Zero Waste User)
 * Clean, minimal confirmation receipt with booking reference and schedule summary.
 */
export default function KabadSuccessScreen({
  booking,
  onNewBooking,
  onGoHome,
}) {
  const isTechnicianWeighing = booking?.entryMode === 'pickup' || !booking?.items || booking.items.length === 0;
  const items = booking?.items || [];

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* 1. Header Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs">
          <CheckCircle2 size={32} />
        </div>

        <div className="mt-3">
          <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-200">
            Booking Confirmed
          </span>
          <h2 className="mt-1 font-heading text-lg font-bold text-ink">
            Kabaad Pickup Scheduled
          </h2>
        </div>

        {/* Reference Request ID */}
        <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
            Request Reference ID
          </span>
          <p className="font-mono text-base font-extrabold text-emerald-800 tracking-wider">
            {booking?.id || 'KAB-2026-0042'}
          </p>
        </div>
      </div>

      {/* 2. Schedule Details */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
          Scheduled Window
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-100">
            <span className="text-[10px] text-ink-muted block">Day & Date</span>
            <p className="font-bold text-ink mt-0.5">
              {booking?.slotDay ? `${booking.slotDay}, ` : ''}
              {booking?.formattedDate || booking?.slotDate || 'Scheduled Slot'}
            </p>
          </div>

          <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-100">
            <span className="text-[10px] text-ink-muted block">Time Slot</span>
            <p className="font-bold text-emerald-800 mt-0.5">
              {booking?.timeRange || booking?.slotTime || 'Morning Slot'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Items or Entry Notice */}
      {isTechnicianWeighing ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-900">
            <Truck size={15} />
            <span className="font-heading text-xs font-bold uppercase tracking-wider">
              Doorstep Weighing
            </span>
          </div>
          <p className="text-xs text-stone-700 font-medium">
            Zero Waste Technician will weigh all kabaad at your doorstep and make instant payment.
          </p>
          <p className="text-xs text-stone-600 font-sans">
            सामान का वजन और प्रविष्टि जीरो वेस्ट तकनीशियन द्वारा आपके स्थान पर पहुंचने पर की जाएगी।
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="text-xs font-bold text-ink">
              Recorded Kabaad Items ({items.length})
            </span>
            <span className="font-mono text-xs font-extrabold text-emerald-800">
              Est. Total: {formatCurrency(booking?.grandTotal || 0)}
            </span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-1.5">
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="font-mono text-[10px] text-ink-muted">
                    {item.weight} {item.unit} @ ₹{item.pricePerUnit}/{item.unit}
                  </p>
                </div>
                <span className="font-mono font-bold text-ink">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onNewBooking}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 active:scale-95"
        >
          <PlusCircle size={14} />
          <span>Book Another Kabaad Request</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 text-xs font-semibold text-ink hover:bg-stone-50 active:scale-95"
        >
          <Home size={14} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
