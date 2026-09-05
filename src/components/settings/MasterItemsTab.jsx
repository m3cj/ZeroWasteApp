import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tag } from 'lucide-react';
import VerifiedBadge from '../shared/VerifiedBadge';

export default function MasterItemsTab({ masterItems = [], setMasterItems }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', unit: 'kg', pricePerUnit: '' });
  const [editingId, setEditingId] = useState(null);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || Number(newItem.pricePerUnit) <= 0) return;

    const nextId = `ITM-${String(masterItems.length + 1).padStart(3, '0')}`;
    setMasterItems((prev) => [
      ...prev,
      {
        id: nextId,
        name: newItem.name.trim(),
        unit: newItem.unit.trim() || 'kg',
        pricePerUnit: Number(newItem.pricePerUnit),
      },
    ]);

    setNewItem({ name: '', unit: 'kg', pricePerUnit: '' });
    setIsAdding(false);
  };

  const handleUpdatePrice = (id, newPrice) => {
    const safePrice = Number(newPrice) || 0;
    setMasterItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pricePerUnit: safePrice } : item
      )
    );
  };

  const handleUpdateName = (id, newName) => {
    setMasterItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: newName } : item
      )
    );
  };

  const handleRemove = (id) => {
    setMasterItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-bold text-ink">Master Item Rates</h3>
          <p className="text-[11px] text-ink-muted">Anti-tamper prices used across POS</p>
        </div>
        <button
          onClick={() => setIsAdding((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-xl bg-route px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-route-dark active:scale-95"
        >
          <Plus size={13} />
          <span>{isAdding ? 'Cancel' : 'Add Item'}</span>
        </button>
      </div>

      {/* Add New Item Mobile Card Form */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="rounded-2xl border-2 border-route/30 bg-route-soft/40 p-4 shadow-sm space-y-3 animate-slide-up"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-route">
            New Master Item
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="mobile-label">Item Name</label>
              <input
                type="text"
                placeholder="e.g. Mixed Cardboard"
                value={newItem.name}
                onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                className="mobile-input text-xs"
                required
              />
            </div>

            <div>
              <label className="mobile-label">Unit</label>
              <input
                type="text"
                placeholder="kg"
                value={newItem.unit}
                onChange={(e) => setNewItem((prev) => ({ ...prev, unit: e.target.value }))}
                className="mobile-input text-xs"
                required
              />
            </div>

            <div>
              <label className="mobile-label">Rate (₹ / unit)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="0.00"
                value={newItem.pricePerUnit}
                onChange={(e) => setNewItem((prev) => ({ ...prev, pricePerUnit: e.target.value }))}
                className="mobile-input font-mono text-xs"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary py-2.5 text-xs">
              Save Item
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-secondary py-2.5 text-xs w-auto px-4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Items Cards List */}
      <div className="space-y-2.5">
        {masterItems.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-stone-200/90 bg-white p-3 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateName(item.id, e.target.value)}
                      className="mobile-input py-1 text-xs font-bold"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <p className="font-heading text-xs font-bold text-ink">{item.name}</p>
                      <span className="font-mono text-[10px] text-stone-400">({item.id})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingId(isEditing ? null : item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                    title={isEditing ? 'Done' : 'Edit'}
                  >
                    {isEditing ? <Check size={12} className="text-ledger" /> : <Edit2 size={12} />}
                  </button>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stamp/20 bg-stamp-soft text-stamp hover:bg-stamp hover:text-white"
                    title="Delete item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Price & Unit Row */}
              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-2 text-xs">
                <span className="text-ink-muted">Master Price Rate</span>

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">₹</span>
                    <input
                      type="number"
                      step="0.1"
                      value={item.pricePerUnit}
                      onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                      className="w-20 rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-xs text-right font-bold text-ink"
                    />
                    <span className="font-mono text-xs text-ink-muted">/ {item.unit}</span>
                  </div>
                ) : (
                  <VerifiedBadge label={`₹${Number(item.pricePerUnit).toFixed(2)} / ${item.unit}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
