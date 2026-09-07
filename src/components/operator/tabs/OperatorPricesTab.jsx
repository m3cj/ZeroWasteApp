import { useState, useMemo } from 'react';
import {
  Tag,
  Search,
  ArrowUpDown,
  Edit2,
  Check,
  X,
  History,
  RotateCcw,
  AlertTriangle,
  Layers,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../../utils/formatters';
import {
  updateItemPrice,
  bulkAdjustPrices,
  revertLastBulkPriceRevision,
} from '../../../db/operations';
import WasteIcon from '../../shared/WasteIcon';

export default function OperatorPricesTab({
  masterItems = [],
  wasteGroups = [],
  wasteCategories = [],
  priceAuditLog = [],
  currentStaff,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editRateValue, setEditRateValue] = useState('');

  // Bulk rate revision staging & preview
  const [bulkPercent, setBulkPercent] = useState('');
  const [bulkTarget, setBulkTarget] = useState('all');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [excludedItemIds, setExcludedItemIds] = useState(new Set());
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Active groups
  const activeGroups = useMemo(() => {
    if (wasteGroups.length > 0) {
      return wasteGroups.filter((g) =>
        masterItems.some(
          (i) =>
            i.wasteGroup === g.name ||
            i.groupId === g.id ||
            i.groupId === g.name
        )
      );
    }
    const names = [...new Set(masterItems.map((i) => i.wasteGroup).filter(Boolean))];
    return names.map((n) => ({ id: n, name: n, icon: 'Boxes' }));
  }, [wasteGroups, masterItems]);

  const filteredItems = useMemo(() => {
    return masterItems.filter((item) => {
      if (selectedGroup !== 'all') {
        const matchGroup =
          item.wasteGroup === selectedGroup ||
          item.groupId === selectedGroup;
        if (!matchGroup) return false;
      }
      if (selectedCategory !== 'all') {
        const matchCat =
          item.categoryId === selectedCategory ||
          item.wasteCategory === selectedCategory;
        if (!matchCat) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (item.name || '').toLowerCase().includes(q) ||
          (item.wasteCategory || '').toLowerCase().includes(q) ||
          (item.id || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [masterItems, selectedGroup, selectedCategory, searchQuery]);

  // Candidates for bulk revision based on bulkTarget
  const bulkCandidateItems = useMemo(() => {
    return masterItems.filter((item) => {
      if (bulkTarget === 'all') return true;
      return item.categoryId === bulkTarget || item.wasteCategory === bulkTarget;
    });
  }, [masterItems, bulkTarget]);

  // Calculated preview items with before/after prices
  const previewData = useMemo(() => {
    const pct = Number(bulkPercent);
    if (isNaN(pct) || pct === 0) return [];

    const factor = 1 + pct / 100;
    return bulkCandidateItems.map((item) => {
      const currentPrice = Number(item.pricePerUnit || 0);
      const newPrice = Math.round(currentPrice * factor * 100) / 100;
      const diff = Math.round((newPrice - currentPrice) * 100) / 100;
      const isExcluded = excludedItemIds.has(item.id);
      return {
        ...item,
        currentPrice,
        newPrice,
        diff,
        isExcluded,
      };
    });
  }, [bulkCandidateItems, bulkPercent, excludedItemIds]);

  const activeBulkShiftCount = useMemo(() => {
    return previewData.filter((i) => !i.isExcluded).length;
  }, [previewData]);

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditRateValue(String(item.pricePerUnit));
  };

  const handleSaveEdit = (itemId) => {
    const num = Number(editRateValue);
    if (!isNaN(num) && num >= 0.5) {
      updateItemPrice(itemId, num, currentStaff?.id || 'STF-003');
      showToast(`Rate updated to ₹${num}`);
    }
    setEditingItemId(null);
  };

  // Trigger preview modal
  const handleOpenPreview = (e) => {
    e.preventDefault();
    const pct = Number(bulkPercent);
    if (isNaN(pct) || pct === 0) {
      showToast('Please specify a valid percentage shift');
      return;
    }
    setExcludedItemIds(new Set());
    setIsPreviewOpen(true);
  };

  // Toggle item exclusion in preview
  const toggleItemExclusion = (itemId) => {
    setExcludedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSelectAllPreview = () => {
    if (excludedItemIds.size === 0) {
      // Exclude all
      setExcludedItemIds(new Set(previewData.map((i) => i.id)));
    } else {
      // Include all
      setExcludedItemIds(new Set());
    }
  };

  // Commit bulk price revision
  const handleCommitBulkShift = () => {
    const pct = Number(bulkPercent);
    if (isNaN(pct) || pct === 0) return;

    const selectedIds = previewData.filter((i) => !i.isExcluded).map((i) => i.id);
    if (selectedIds.length === 0) {
      showToast('No items selected for rate revision');
      return;
    }

    bulkAdjustPrices(bulkTarget, pct, currentStaff?.id || 'STF-003', selectedIds);
    setIsPreviewOpen(false);
    setBulkPercent('');
    showToast(`Successfully updated rates for ${selectedIds.length} items (${pct > 0 ? '+' : ''}${pct}%)`);
  };

  // Undo last bulk revision
  const handleUndoLastBulk = () => {
    if (window.confirm('Undo the most recent bulk rate revision and restore previous prices?')) {
      const reverted = revertLastBulkPriceRevision(currentStaff?.id || 'STF-003');
      if (reverted > 0) {
        showToast(`Reverted rates for ${reverted} items back to previous values`);
      } else {
        showToast('No recent bulk revision found to undo');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold text-ink tracking-tight">
              Kabaad Prices
            </h1>
            <span className="font-mono text-xs text-stone-500 font-semibold">
              ({masterItems.length} active purchase rates)
            </span>
          </div>
          <p className="font-mono text-xs text-stone-500 mt-0.5">
            Real-time material scrap rates & audited price controls
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-ink hover:bg-stone-100 active:scale-95 transition"
          >
            <History size={14} className="text-primary" />
            <span>Price Audit Log ({priceAuditLog.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, code, or material category..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-8 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Group Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
          <span className="text-[11px] font-bold text-stone-500 uppercase font-mono mr-1">Group:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedGroup('all');
              setSelectedCategory('all');
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition shrink-0 ${
              selectedGroup === 'all'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Groups
          </button>
          {activeGroups.map((grp) => (
            <button
              key={grp.id}
              type="button"
              onClick={() => {
                setSelectedGroup(grp.name);
                setSelectedCategory('all');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition shrink-0 ${
                selectedGroup === grp.name
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <WasteIcon token={grp.icon || grp.name} size={13} />
              <span>{grp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rates Table with Inline Editing */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] font-bold text-stone-600">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Item Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Unit</th>
                <th className="px-5 py-3 text-right">Rate (₹/Unit)</th>
                <th className="px-5 py-3 text-right">Edit Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isEditing = editingItemId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition">
                      <td className="px-5 py-3 font-mono font-bold text-stone-500">
                        {item.id}
                      </td>

                      <td className="px-5 py-3 font-heading font-bold text-ink">
                        {item.name}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 font-medium text-stone-700">
                          <WasteIcon token={item.categoryIcon || item.wasteCategory} size={14} className="text-stone-600" />
                          <span>{item.wasteCategory || 'Uncategorized'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3 font-mono text-stone-500 uppercase">
                        {item.unit || 'kg'}
                      </td>

                      <td className="px-5 py-3 font-mono text-right font-bold text-ink">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-stone-400">₹</span>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={editRateValue}
                              onChange={(e) => setEditRateValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(item.id);
                                if (e.key === 'Escape') setEditingItemId(null);
                              }}
                              autoFocus
                              className="w-20 rounded-lg border border-primary bg-white p-1 text-right font-mono text-xs font-bold text-ink focus:outline-none"
                            />
                          </div>
                        ) : (
                          <span className="text-emerald-800 text-sm font-bold">
                            {formatCurrency(item.pricePerUnit || 0)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-50 transition"
                              title="Save Rate"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 transition"
                              title="Cancel"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-ink transition"
                            title="Edit Rate"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-stone-500">
                    No items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* BULK REVISION REVIEW MODAL (STAGING & SELECTIVE COMMITTING) - DISABLED FROM UI */}
      {false && isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base font-bold text-ink">
                    Review Bulk Rate Revision
                  </h2>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      Number(bulkPercent) > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {Number(bulkPercent) > 0 ? `+${bulkPercent}%` : `${bulkPercent}%`}
                  </span>
                </div>
                <p className="font-mono text-xs text-stone-500 mt-0.5">
                  Scope: {bulkTarget === 'all' ? 'All Categories' : `${wasteCategories.find((c) => c.id === bulkTarget)?.name || bulkTarget}`} • {activeBulkShiftCount} items selected
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selection helper bar */}
            <div className="flex items-center justify-between text-xs font-mono bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={excludedItemIds.size === 0}
                  onChange={toggleSelectAllPreview}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Select All ({previewData.length} items)</span>
              </label>

              <span className="text-stone-500 text-[11px]">
                Uncheck items you do not want to alter
              </span>
            </div>

            {/* Preview Comparison Table */}
            <div className="overflow-y-auto flex-1 border border-stone-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-stone-100 font-mono text-[11px] font-bold text-stone-600 border-b border-stone-200/70">
                  <tr>
                    <th className="px-3.5 py-2.5 w-8">Include</th>
                    <th className="px-3.5 py-2.5">Item Name</th>
                    <th className="px-3.5 py-2.5 text-right">Current Rate</th>
                    <th className="px-3.5 py-2.5 text-right">New Rate</th>
                    <th className="px-3.5 py-2.5 text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {previewData.map((item) => {
                    const isExcluded = item.isExcluded;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => toggleItemExclusion(item.id)}
                        className={`cursor-pointer transition ${
                          isExcluded
                            ? 'bg-stone-50/50 opacity-40 hover:opacity-75'
                            : 'hover:bg-stone-50/80'
                        }`}
                      >
                        <td className="px-3.5 py-2">
                          <input
                            type="checkbox"
                            checked={!isExcluded}
                            onChange={() => toggleItemExclusion(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-3.5 py-2 font-heading font-bold text-ink">
                          {item.name}
                          <span className="font-mono text-[10px] text-stone-400 font-normal ml-2">
                            ({item.id})
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-right text-stone-500">
                          {formatCurrency(item.currentPrice)}
                        </td>
                        <td className="px-3.5 py-2 text-right font-bold text-ink">
                          {formatCurrency(item.newPrice)}
                        </td>
                        <td className="px-3.5 py-2 text-right">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.diff > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.diff > 0 ? `+${formatCurrency(item.diff)}` : formatCurrency(item.diff)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
              <span className="font-mono text-xs text-stone-600">
                Ready to update <strong>{activeBulkShiftCount}</strong> of {previewData.length} items
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-stone-100 transition"
                >
                  Cancel / Discard
                </button>
                <button
                  type="button"
                  onClick={handleCommitBulkShift}
                  disabled={activeBulkShiftCount === 0}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-40 transition flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Confirm & Apply Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-heading text-base font-bold text-ink">
                  Price Revision Audit Log
                </h2>
                <p className="font-mono text-xs text-stone-500 mt-0.5">
                  Chronological record of scrap rate updates & bulk shifts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 text-xs">
              {priceAuditLog.length > 0 ? (
                priceAuditLog.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-heading font-bold text-ink">{log.itemName}</p>
                        {log.isRevert && (
                          <span className="font-mono text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            REVERT
                          </span>
                        )}
                        {log.batchId && (
                          <span className="font-mono text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                            BULK
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-stone-500">
                        {log.changedBy || 'STF-003'} • {formatDateTime(log.changedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono font-bold">
                      <span className="text-stone-400 line-through">
                        ₹{log.oldPrice}
                      </span>
                      <span className="text-stone-400">→</span>
                      <span className="text-emerald-800">₹{log.newPrice}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-stone-500">No price audit entries found.</p>
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-ink hover:bg-stone-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
