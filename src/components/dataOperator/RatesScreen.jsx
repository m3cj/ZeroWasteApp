import { useMemo, useState } from 'react';
import { Check, History, Search, X } from 'lucide-react';
import MaterialTag from '../shared/MaterialTag';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { updateItemPrice, bulkAdjustPrices } from '../../db/operations';

const BULK_PRESETS = [5, 10, -5, -10];

export default function RatesScreen({ masterItems, wasteCategories, wasteGroups, priceAuditLog, staffId }) {
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [bulkCategory, setBulkCategory] = useState('all');
  const [bulkPercent, setBulkPercent] = useState('');
  const [showAudit, setShowAudit] = useState(false);

  const categoriesById = useMemo(
    () => Object.fromEntries(wasteCategories.map((c) => [c.id, c])),
    [wasteCategories]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return masterItems
      .filter((item) => !q || item.name.toLowerCase().includes(q))
      .map((item) => ({ item, category: categoriesById[item.categoryId] }));
  }, [masterItems, categoriesById, query]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue(String(item.pricePerUnit));
  };

  const commitEdit = (itemId) => {
    const value = Number(editValue);
    if (!Number.isNaN(value) && value > 0) {
      updateItemPrice(itemId, value, staffId);
    }
    setEditingId(null);
  };

  const applyBulk = () => {
    const percent = Number(bulkPercent);
    if (!percent) return;
    bulkAdjustPrices(bulkCategory, percent, staffId);
    setBulkPercent('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">Live buy rates</h2>
          <p className="text-xs text-ink-muted">Every change writes to the audit trail below.</p>
        </div>
        <button
          onClick={() => setShowAudit((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-light hover:bg-stone-50"
        >
          <History size={13} />
          {showAudit ? 'Hide' : 'Show'} audit trail
        </button>
      </div>

      {/* Bulk adjustment toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-3">
        <select
          value={bulkCategory}
          onChange={(e) => setBulkCategory(e.target.value)}
          className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs"
        >
          <option value="all">All categories</option>
          {wasteCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {BULK_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setBulkPercent(String(p)); bulkAdjustPrices(bulkCategory, p, staffId); }}
            className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono font-semibold text-ink-light hover:bg-stone-50"
          >
            {p > 0 ? `+${p}%` : `${p}%`}
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={bulkPercent}
            onChange={(e) => setBulkPercent(e.target.value)}
            placeholder="Custom %"
            className="w-24 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
          />
          <button onClick={applyBulk} className="rounded-lg bg-route px-3 py-1.5 text-xs font-semibold text-white hover:bg-route-dark">
            Apply
          </button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search item name"
          className="w-full rounded-lg border border-stone-200 py-1.5 pl-8 pr-3 text-xs"
        />
      </div>

      {/* Rate register */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-[11px] font-semibold text-ink-muted">
              <th className="px-4 py-2.5">Material</th>
              <th className="px-4 py-2.5">Item</th>
              <th className="px-4 py-2.5 text-right">Rate / unit</th>
              <th className="w-20 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map(({ item, category }) => (
              <tr key={item.id} className="hover:bg-stone-50/70">
                <td className="px-4 py-2.5">
                  {category && <MaterialTag groupId={category.groupId} label={category.name} />}
                </td>
                <td className="px-4 py-2.5 font-medium text-ink">{item.name}</td>
                <td className="px-4 py-2.5 text-right font-mono">
                  {editingId === item.id ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-ink-muted">₹</span>
                      <input
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commitEdit(item.id)}
                        className="w-20 rounded-md border border-route px-1.5 py-1 text-right"
                      />
                      <button onClick={() => commitEdit(item.id)} className="text-ledger">
                        <Check size={15} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-stamp">
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(item)} className="font-semibold text-ink hover:text-route">
                      ₹{item.pricePerUnit.toFixed(2)} / {item.unit}
                    </button>
                  )}
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAudit && (
        <div className="rounded-xl border border-stone-200 bg-white">
          <div className="border-b border-stone-100 px-4 py-2.5">
            <p className="text-xs font-semibold text-ink">Price audit trail</p>
          </div>
          <div className="max-h-64 divide-y divide-stone-100 overflow-y-auto">
            {priceAuditLog.length === 0 ? (
              <p className="px-4 py-4 text-xs text-ink-muted">No price changes logged yet.</p>
            ) : (
              priceAuditLog.map((row) => (
                <div key={row.id} className="flex items-center justify-between px-4 py-2 text-xs">
                  <span className="text-ink-light">{row.itemName}</span>
                  <span className="font-mono text-ink-muted">
                    ₹{row.oldPrice} → <span className="font-semibold text-ink">₹{row.newPrice}</span>
                  </span>
                  <span className="text-[11px] text-ink-faint">{formatDateTime(row.changedAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
