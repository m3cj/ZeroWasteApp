import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import KuraItemEntry from '../shared/KuraItemEntry';
import { formatCurrency } from '../../utils/formatters';

/**
 * Screen: Purchase Kabaad
 * - Title: Purchase Kabaad
 * - Short user info: Ticket ID, Name, Category only
 * - Immediate Kabaad Item entry form
 * - In-screen Proceed button (no floating sticky bar, disabled when 0 items)
 */
export default function StaffItemEntryScreen({
  staffEntry,
  setStaffEntry,
  masterItems = [],
  wasteGroups = [],
  wasteCategories = [],
  onProceedToSlot,
}) {
  const items = staffEntry.items || [];

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

  return (
    <div className="space-y-3 pb-6 animate-fade-in">
      {/* 1. Title */}
      <div>
        <h2 className="font-heading text-lg font-bold text-ink tracking-tight">
          Purchase Kabaad
        </h2>
      </div>

      {/* 2. Short User Info: Ticket ID, Name, Category only */}
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

      {/* 3. Kabaad Item Form starts immediately (Direct single container, no nested wrapper) */}
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
    </div>
  );
}
