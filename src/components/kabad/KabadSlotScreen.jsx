import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  Truck,
  MapPin,
  Phone,
  User,
  ShieldCheck,
} from 'lucide-react';
import StickyBottomBar from '../shared/StickyBottomBar';
import { formatCurrency } from '../../utils/formatters';

/**
 * Flow 1 - Page 3: Review & Final Confirmation Screen (Role: Zero Waste User)
 * Displays scheduled pickup slot, seller contact/address details, kabaad breakdown or doorstep weighing notice.
 * Clicking "Final Submit Request" confirms the pickup booking.
 */
export default function KabadSlotScreen({
  kabadData,
  masterSlots = [],
  onConfirmBooking,
  onBack,
}) {
  const isPickupWeighing = kabadData.entryMode === 'pickup' || !kabadData.items || kabadData.items.length === 0;

  // Local state for seller contact & address
  const [sellerName, setSellerName] = useState(kabadData.sellerName || 'Ramesh Kumar');
  const [contactPhone, setContactPhone] = useState(kabadData.contactPhone || '9876543210');
  const [sellerAddress, setSellerAddress] = useState(
    kabadData.address || 'Flat 302, Shanti Vihar Appts, Kankarbagh, Patna'
  );

  const cartGrandTotal = (kabadData.items || []).reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    if (!sellerName.trim() || !sellerAddress.trim()) return;

    onConfirmBooking({
      ...kabadData,
      sellerName: sellerName.trim(),
      contactPhone: contactPhone.trim(),
      address: sellerAddress.trim(),
      grandTotal: isPickupWeighing ? 0 : cartGrandTotal,
    });
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Header */}
      <div>
        <h2 className="font-heading text-lg font-bold text-ink">
          Confirm Kabaad Pickup
        </h2>
        <p className="text-xs text-ink-muted">
          Review your scheduled slot, address, and submit request.
        </p>
      </div>

      {/* 2. Scheduled Slot Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <CalendarDays size={15} />
            </div>
            <span className="font-heading text-xs sm:text-sm font-bold text-ink">
              Confirmed Pickup Window
            </span>
          </div>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-200">
            {kabadData.slotName || 'Scheduled Slot'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-100">
            <span className="text-[10px] font-medium text-ink-muted block">Pickup Day & Date</span>
            <p className="font-bold text-ink mt-0.5">
              {kabadData.slotDay ? `${kabadData.slotDay}, ` : ''}
              {kabadData.formattedDate || kabadData.slotDate || 'Selected Date'}
            </p>
          </div>

          <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-100">
            <span className="text-[10px] font-medium text-ink-muted block">Time Window</span>
            <p className="font-bold text-emerald-800 mt-0.5 font-mono">
              {kabadData.timeRange || kabadData.slotTime || 'Morning Slot'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Kabaad Details: Doorstep Notice or Items */}
      {isPickupWeighing ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 border-b border-emerald-200/80 pb-2">
            <Truck size={16} />
            <span className="font-heading text-xs font-bold uppercase tracking-wider">
              Doorstep Weighing & Instant Payment
            </span>
          </div>
          <div className="space-y-1 text-xs text-stone-800">
            <p className="font-medium">
              Zero Waste Technician will arrive with certified scales to weigh all kabaad at your doorstep.
            </p>
            <p className="text-[11px] font-sans text-stone-600">
              सामान का वजन और प्रविष्टि जीरो वेस्ट तकनीशियन द्वारा आपके स्थान पर पहुंचने पर की जाएगी।
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="text-xs font-bold text-ink">
              Recorded Kabaad Items ({(kabadData.items || []).length})
            </span>
            <span className="font-mono text-xs font-extrabold text-emerald-800">
              Est. Total: {formatCurrency(cartGrandTotal)}
            </span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {(kabadData.items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between py-2">
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="font-mono text-[10px] text-ink-muted">
                    {item.weight} {item.unit} @ ₹{item.pricePerUnit}/{item.unit}
                  </p>
                </div>
                <span className="font-mono font-bold text-emerald-800">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Seller Contact & Address Information */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
        <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <User size={14} className="text-emerald-800" />
            <span>Pickup Address & Contact</span>
          </span>
          <span className="text-[10px] text-ink-muted">Verify details</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Pickup Address *
              </label>
              <input
                type="text"
                required
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="Street address, flat / house no."
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Bar */}
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
            onClick={handleFinalSubmit}
            disabled={!sellerName.trim() || !sellerAddress.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
          >
            <span>Final Submit Request</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </StickyBottomBar>
    </div>
  );
}
