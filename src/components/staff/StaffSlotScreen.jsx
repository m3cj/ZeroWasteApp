import { useState } from 'react';
import { Banknote, QrCode, CreditCard, ArrowRight } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import { formatCurrency } from '../../utils/formatters';

/**
 * Screen: Review & Pay (formerly StaffSlotScreen)
 * - Title: Review & Pay
 * - Small user info: Ticket ID, Name, Category
 * - Kabaad Item list with totals
 * - Payment Method selection: Cash, UPI, Other
 * - In-screen action button
 */
export default function StaffSlotScreen({
  staffEntry,
  onConfirmBooking,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi' | 'other'

  const items = staffEntry.items || [];
  const cartGrandTotal = items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );
  const totalWeight = items.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  );

  const handleSubmit = () => {
    onConfirmBooking({
      ...staffEntry,
      paymentMethod,
      grandTotal: cartGrandTotal,
    });
  };

  const paymentOptions = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'upi', label: 'UPI', icon: QrCode },
    { id: 'other', label: 'Other', icon: CreditCard },
  ];

  return (
    <div className="space-y-3.5 pb-6 animate-fade-in">
      {/* 1. Header */}
      <div>
        <h2 className="font-heading text-lg font-bold text-ink tracking-tight">
          Review & Pay
        </h2>
      </div>

      {/* 2. Small User Info: Ticket ID, Name, Category */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-heading text-sm font-bold text-ink truncate">
              {staffEntry.name || staffEntry.ownerName || 'Customer'}
            </span>
            <CategoryTag category={staffEntry.category} size="xs" />
          </div>

          {staffEntry.ticketId && (
            <span className="font-mono text-[9px] font-bold text-stone-600 bg-stone-100 rounded px-1.5 py-0.5 shrink-0 border border-stone-200/60">
              {staffEntry.ticketId}
            </span>
          )}
        </div>
      </div>

      {/* 3. Kabaad Item Section (renamed from Recorded Kabaad Items) */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
            Kabaad Item ({items.length})
          </h3>
          <span className="font-mono text-xs font-bold text-stone-500">
            {Math.round(totalWeight * 10) / 10} kg total
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-stone-400 py-2 text-center">No items recorded</p>
        ) : (
          <div className="divide-y divide-stone-100 text-xs font-mono">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-bold text-ink truncate">{item.name}</p>
                  <p className="text-[10px] text-stone-500">
                    {item.weight} {item.unit || 'kg'} × ₹{item.pricePerUnit || item.rate}/{item.unit || 'kg'}
                  </p>
                </div>
                <span className="font-bold text-ink pl-2">
                  {formatCurrency(item.subtotal || item.amount || 0)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grand Total Summary */}
        <div className="border-t-2 border-stone-200/80 pt-2.5 flex items-center justify-between font-mono">
          <span className="font-heading text-xs font-bold text-ink">Total Payout</span>
          <span className="text-base font-extrabold text-[#2C5F74]">
            {formatCurrency(cartGrandTotal)}
          </span>
        </div>
      </div>

      {/* 4. Select Payment Method Section: Cash, UPI, Other */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-2.5">
        <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
          Select Payment Method
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {paymentOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = paymentMethod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaymentMethod(opt.id)}
                className={`flex flex-col items-center justify-center rounded-xl p-3 border transition active:scale-95 ${
                  isSelected
                    ? 'border-[#2C5F74] bg-[#2C5F74]/10 font-bold text-[#2C5F74] shadow-xs'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-white text-stone-600'
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-[#2C5F74]' : 'text-stone-500'} />
                <span className="mt-1 font-heading text-xs font-bold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. In-screen Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C5F74] py-3.5 px-4 text-sm font-bold text-white shadow-md shadow-[#2C5F74]/20 hover:bg-[#234d5e] active:scale-[0.985] transition cursor-pointer"
        >
          <span>Confirm & Pay</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
