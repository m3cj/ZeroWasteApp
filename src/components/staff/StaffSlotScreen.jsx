import { useState } from 'react';
import { Banknote, QrCode, CreditCard, ArrowRight, ArrowLeft, UserPlus, X } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import { formatCurrency } from '../../utils/formatters';

/**
 * Screen: Review & Pay (formerly StaffSlotScreen)
 * - Title: Review & Pay
 * - User info: Shows selected customer OR "Add Customer" option (stag intake with no compulsory fields)
 * - In-screen back button
 * - Kabaad Item list with totals
 * - Payment Method selection: Cash, UPI, Other
 * - In-screen action button
 */
export default function StaffSlotScreen({
  staffEntry,
  onConfirmBooking,
  onBack,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi' | 'other'

  // Optional customer details for Stag Kabaad Entry (no fields compulsory)
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCategory, setCustomerCategory] = useState('family');

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
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerCategory,
    });
  };

  const paymentOptions = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'upi', label: 'UPI', icon: QrCode },
    { id: 'other', label: 'Other', icon: CreditCard },
  ];

  const hasUser = Boolean(staffEntry.name || staffEntry.generatorId || staffEntry.generator);

  return (
    <div className="space-y-3.5 pb-6 animate-fade-in">
      {/* 1. Header with Back Button */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-200/70 hover:bg-stone-300 text-stone-700 active:scale-95 transition shrink-0"
            title="Back to Kabaad Entry"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <h2 className="font-heading text-lg font-bold text-ink tracking-tight">
            Review & Pay
          </h2>
        </div>
      </div>

      {/* 2. User Info OR Stag Add Customer Option */}
      {hasUser ? (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-heading text-sm font-bold text-ink truncate">
                {staffEntry.name || staffEntry.ownerName || 'Customer'}
              </span>
              {staffEntry.category && <CategoryTag category={staffEntry.category} size="xs" />}
            </div>

            {staffEntry.ticketId && (
              <span className="font-mono text-[9px] font-bold text-stone-600 bg-stone-100 rounded px-1.5 py-0.5 shrink-0 border border-stone-200/60">
                {staffEntry.ticketId}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2C5F74]/10 text-[#2C5F74]">
                <UserPlus size={15} />
              </div>
              <div>
                <h3 className="font-heading text-xs font-bold text-ink">
                  Add Customer
                </h3>
                <p className="font-mono text-[10px] text-stone-400">
                  Optional • No fields compulsory
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCustomer((prev) => !prev)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 flex items-center gap-1 ${
                showAddCustomer
                  ? 'border border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200'
                  : 'bg-[#2C5F74] text-white hover:bg-[#234d5e] shadow-xs'
              }`}
            >
              <span>{showAddCustomer ? 'Hide' : '+ Add Customer'}</span>
            </button>
          </div>

          {showAddCustomer && (
            <div className="pt-2.5 border-t border-stone-100 space-y-2.5 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Customer Name <span className="font-normal text-stone-400 font-mono">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-[#2C5F74] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Phone Number <span className="font-normal text-stone-400 font-mono">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9841234567"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-[#2C5F74] focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Category <span className="font-normal text-stone-400 font-mono">(Optional)</span>
                  </label>
                  <select
                    value={customerCategory}
                    onChange={(e) => setCustomerCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-2.5 py-2 text-xs font-medium text-ink focus:border-[#2C5F74] focus:bg-white focus:outline-none transition"
                  >
                    <option value="family">Family (Residential)</option>
                    <option value="business">Business (Commercial)</option>
                    <option value="public">Public / Institution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Address / Location <span className="font-normal text-stone-400 font-mono">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. Kupondole, Ward 3"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-[#2C5F74] focus:bg-white focus:outline-none transition"
                />
              </div>

              {(customerName || customerPhone || customerAddress) && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 border border-emerald-200/70 text-xs">
                  <span className="font-medium text-emerald-800 truncate">
                    Profile will be registered for: <strong>{customerName || 'Direct Citizen'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerName('');
                      setCustomerPhone('');
                      setCustomerAddress('');
                      setCustomerCategory('family');
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 ml-2"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
