import { useMemo, useState } from 'react';
import { Banknote, Plus, Smartphone, Trash2, Wallet } from 'lucide-react';
import StickyBottomBar from '../shared/StickyBottomBar';
import MaterialTag from '../shared/MaterialTag';
import VerifiedBadge from '../shared/VerifiedBadge';
import { PAYMENT_META } from '../../constants';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const PAYMENT_ICONS = { cash: Banknote, upi: Smartphone, other: Wallet };

export default function PurchaseScreen({
  generator,
  masterItems,
  wasteCategories,
  wasteGroups,
  receipt,
  onConfirm,
  onDone,
}) {
  const [selectedItemId, setSelectedItemId] = useState(masterItems[0]?.id || '');
  const [weight, setWeight] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');

  const groupedItems = useMemo(() => {
    return wasteCategories.map((category) => ({
      category,
      items: masterItems.filter((item) => item.categoryId === category.id && item.isEnabled),
    }));
  }, [masterItems, wasteCategories]);

  const selectedItem = masterItems.find((i) => i.id === selectedItemId);
  const selectedCategory = wasteCategories.find((c) => c.id === selectedItem?.categoryId);

  const grandTotal = cart.reduce((sum, row) => sum + row.amount, 0);

  const handleAddRow = () => {
    const weightNum = Number(weight);
    if (!selectedItem || !weightNum || weightNum <= 0) return;
    setCart((prev) => [
      ...prev,
      {
        itemId: selectedItem.id,
        name: selectedItem.name,
        groupId: selectedCategory?.groupId,
        weight: weightNum,
        rate: selectedItem.pricePerUnit,
        amount: Math.round(weightNum * selectedItem.pricePerUnit * 100) / 100,
      },
    ]);
    setWeight('');
  };

  const handleConfirm = () => {
    if (!cart.length || !paymentMethod) return;
    onConfirm(cart, paymentMethod);
  };

  if (receipt) {
    return (
      <div className="animate-stamp-in receipt-card receipt-edge-top">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-heading text-sm font-bold text-ink">Purchase recorded</p>
            <p className="text-[11px] text-ink-muted">{formatDateTime(receipt.transaction.createdAt)}</p>
          </div>
          <VerifiedBadge label={receipt.transaction.id} size="lg" />
        </div>

        <div className="space-y-1.5 border-y border-dashed border-stone-300 py-3 font-mono text-xs">
          {receipt.transactionItems.map((row) => (
            <div key={row.id} className="flex items-center justify-between text-ink-light">
              <span className="truncate pr-2">{row.itemNameSnapshot} · {row.weight}kg</span>
              <span>{formatCurrency(row.amount)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Paid to {generator.name || generator.ownerName}</span>
          <span className="font-mono text-lg font-bold text-ledger">
            {formatCurrency(receipt.transaction.grandTotal)}
          </span>
        </div>

        <button onClick={onDone} className="btn-ledger mt-5">
          Back to queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div>
        <p className="mobile-label">Purchasing from</p>
        <p className="font-heading text-base font-bold text-ink">{generator.name || generator.ownerName}</p>
        <p className="text-[11px] text-ink-muted">{generator.address}</p>
      </div>

      <div>
        <label className="mobile-label">Scrap item</label>
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="mobile-input text-xs"
        >
          {groupedItems.map(({ category, items }) =>
            items.length ? (
              <optgroup key={category.id} label={category.name}>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — ₹{item.pricePerUnit}/{item.unit}
                  </option>
                ))}
              </optgroup>
            ) : null
          )}
        </select>
        {selectedCategory && (
          <div className="mt-1.5">
            <MaterialTag groupId={selectedCategory.groupId} label={selectedCategory.name} />
          </div>
        )}
      </div>

      <div>
        <label className="mobile-label">Weight ({selectedItem?.unit || 'kg'})</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.0"
            className="mobile-input font-mono text-sm"
          />
          {[5, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setWeight((prev) => String((Number(prev) || 0) + n))}
              className="shrink-0 rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs font-semibold text-ink-light hover:bg-stone-50"
            >
              +{n}
            </button>
          ))}
        </div>
        <button onClick={handleAddRow} className="btn-secondary mt-2.5">
          <Plus size={15} />
          Add to receipt
        </button>
      </div>

      {cart.length > 0 && (
        <div className="receipt-card receipt-edge-top">
          <p className="mobile-label">Receipt</p>
          <div className="space-y-2 font-mono text-xs">
            {cart.map((row, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="min-w-0 truncate pr-2 text-ink-light">
                  {row.name} × {row.weight}kg
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold text-ink">{formatCurrency(row.amount)}</span>
                  <button
                    onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-stone-400 hover:text-stamp"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-dashed border-stone-300 pt-2">
            <span className="text-xs font-semibold text-ink">Grand total</span>
            <span className="font-mono text-base font-bold text-ledger">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div>
          <label className="mobile-label">Payment method</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(PAYMENT_META).map((method) => {
              const Icon = PAYMENT_ICONS[method.id];
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] font-semibold transition-all ${
                    isSelected ? 'border-transparent text-white' : 'border-stone-200 bg-white text-ink-light'
                  }`}
                  style={{ backgroundColor: isSelected ? method.accent : undefined }}
                >
                  <Icon size={15} />
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <StickyBottomBar>
          <div className="text-xs">
            <p className="text-ink-muted">Total</p>
            <p className="font-mono text-base font-bold text-ink">{formatCurrency(grandTotal)}</p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!paymentMethod}
            className="btn-ledger w-auto px-6"
          >
            Confirm & pay
          </button>
        </StickyBottomBar>
      )}
    </div>
  );
}
