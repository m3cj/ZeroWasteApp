import { useState, useMemo } from 'react';
import {
  Database,
  Layers,
  Building2,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ArrowUpDown,
  RefreshCw,
  Clock,
  CalendarDays,
  CheckCircle2,
  History,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

/**
 * Flow 3: Master Control Panel (Role: Data Operator)
 * Designed for operator consistently maintaining the master database:
 * 1. Live Scrap Rates & Inline Price Updates
 * 2. Waste Catalog & Category Taxonomy
 * 3. Generator Classification (Family, Business, Public)
 * 4. Master Pickup Slots Schedule
 */
export default function DataOperatorScreen({
  masterItems = [],
  setMasterItems,
  generatorCategories = [],
  setGeneratorCategories,
  priceAuditLog = [],
  setPriceAuditLog,
  masterSlots = [],
  setMasterSlots,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState('prices'); // 'prices' | 'catalog' | 'generators' | 'slots'
  const [searchQuery, setSearchQuery] = useState('');

  // ----------------------------------------------------
  // TAB 1: LIVE PRICE MASTER (Inline Rate Editing & Audit)
  // ----------------------------------------------------
  const [priceEditingItemId, setPriceEditingItemId] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [bulkAdjustmentPercent, setBulkAdjustmentPercent] = useState('');
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState('all');
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const allGroups = useMemo(() => {
    return [...new Set(masterItems.map((i) => i.wasteGroup || 'Dry Recyclables'))];
  }, [masterItems]);

  const handleStartPriceEdit = (item) => {
    setPriceEditingItemId(item.id);
    setEditPriceValue(String(item.pricePerUnit));
  };

  const handleSavePriceEdit = (itemId) => {
    const numPrice = Number(editPriceValue);
    if (isNaN(numPrice) || numPrice < 0) return;

    const oldItem = masterItems.find((i) => i.id === itemId);
    const oldPrice = oldItem?.pricePerUnit || 0;

    setMasterItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, pricePerUnit: numPrice } : item))
    );

    const auditEntry = {
      id: `AUDIT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      itemId,
      itemName: oldItem?.name || 'Waste Item',
      oldPrice,
      newPrice: numPrice,
      operator: 'Data Operator',
    };
    if (setPriceAuditLog) {
      setPriceAuditLog((prev) => [auditEntry, ...prev]);
    }

    setPriceEditingItemId(null);
  };

  const handleApplyBulkAdjustment = (presetPct = null) => {
    const pct = presetPct !== null ? presetPct : Number(bulkAdjustmentPercent);
    if (isNaN(pct) || pct === 0) return;

    const multiplier = 1 + pct / 100;

    setMasterItems((prev) =>
      prev.map((item) => {
        if (
          bulkCategoryFilter !== 'all' &&
          (item.wasteCategory || item.wasteGroup) !== bulkCategoryFilter
        ) {
          return item;
        }
        const updatedPrice = Math.max(0.5, Math.round(item.pricePerUnit * multiplier * 10) / 10);
        return { ...item, pricePerUnit: updatedPrice };
      })
    );

    const auditEntry = {
      id: `AUDIT-BULK-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      itemId: 'BULK',
      itemName: `Bulk ${pct > 0 ? '+' : ''}${pct}% on ${bulkCategoryFilter}`,
      oldPrice: 0,
      newPrice: pct,
      operator: 'Data Operator',
    };
    if (setPriceAuditLog) {
      setPriceAuditLog((prev) => [auditEntry, ...prev]);
    }

    setBulkAdjustmentPercent('');
  };

  // ----------------------------------------------------
  // TAB 2: WASTE CATALOG MASTER (Add / Edit / Remove Items)
  // ----------------------------------------------------
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    wasteGroup: 'Dry Recyclables',
    wasteCategory: 'Paper & Cardboard',
    unit: 'kg',
    pricePerUnit: 10,
  });

  const filteredItems = useMemo(() => {
    let list = [...masterItems];
    if (selectedGroupFilter !== 'all') {
      list = list.filter((i) => (i.wasteGroup || 'Dry Recyclables') === selectedGroupFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.wasteCategory && i.wasteCategory.toLowerCase().includes(q)) ||
          (i.wasteGroup && i.wasteGroup.toLowerCase().includes(q))
      );
    }
    return list;
  }, [masterItems, selectedGroupFilter, searchQuery]);

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItemForm.name.trim()) return;

    const newId = `ITM-${String(masterItems.length + 1).padStart(3, '0')}`;
    const itemToAdd = {
      id: newId,
      ...newItemForm,
      pricePerUnit: Number(newItemForm.pricePerUnit || 0),
    };

    setMasterItems((prev) => [...prev, itemToAdd]);
    setNewItemForm({
      name: '',
      wasteGroup: 'Dry Recyclables',
      wasteCategory: 'Paper & Cardboard',
      unit: 'kg',
      pricePerUnit: 10,
    });
    setIsAddItemModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Remove this item from the master catalog?')) {
      setMasterItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // ----------------------------------------------------
  // TAB 3: GENERATOR CATEGORIES & SUB-CATEGORIES
  // ----------------------------------------------------
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatVolume, setNewSubCatVolume] = useState('');
  const [selectedCatForSub, setSelectedCatForSub] = useState(
    generatorCategories[1]?.id || generatorCategories[0]?.id || 'business'
  );

  const handleAddSubCategory = (catId) => {
    if (!newSubCatName.trim()) return;

    const newSub = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      name: newSubCatName.trim(),
      estimatedVolumeKg: newSubCatVolume.trim() || '50-200 kg/month',
    };

    setGeneratorCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          return {
            ...cat,
            subCategories: [...(cat.subCategories || []), newSub],
          };
        }
        return cat;
      })
    );

    setNewSubCatName('');
    setNewSubCatVolume('');
  };

  const handleDeleteSubCategory = (catId, subId) => {
    setGeneratorCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          return {
            ...cat,
            subCategories: (cat.subCategories || []).filter((s) => s.id !== subId),
          };
        }
        return cat;
      })
    );
  };

  // ----------------------------------------------------
  // TAB 4: MASTER SLOTS & SCHEDULE CONTROLLER
  // ----------------------------------------------------
  const [newSlotForm, setNewSlotForm] = useState({
    day: 'Monday',
    date: '2026-09-01',
    timeRange: '8:00 AM - 11:00 AM',
    slotName: 'Morning Slot',
    status: 'Available',
    technician: 'Ajay Paswan (Ward Lead)',
  });
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);

  const handleAddSlot = (e) => {
    e.preventDefault();
    const newId = `SLOT-${String(masterSlots.length + 1).padStart(2, '0')}`;
    const dateObj = new Date(newSlotForm.date);
    const formatted = !isNaN(dateObj)
      ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : newSlotForm.date;

    const slotToAdd = {
      id: newId,
      ...newSlotForm,
      formattedDate: formatted,
    };

    if (setMasterSlots) {
      setMasterSlots((prev) => [...prev, slotToAdd]);
    }
    setIsAddSlotModalOpen(false);
  };

  const handleToggleSlotStatus = (slotId) => {
    if (setMasterSlots) {
      setMasterSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? {
                ...s,
                status:
                  (s.status || '').toLowerCase() === 'available' ? 'Full' : 'Available',
              }
            : s
        )
      );
    }
  };

  const handleDeleteSlot = (slotId) => {
    if (setMasterSlots) {
      setMasterSlots((prev) => prev.filter((s) => s.id !== slotId));
    }
  };

  return (
    <div className="space-y-4 pb-16 animate-fade-in">
      {/* Top Breadcrumb Trail */}
      <div className="rounded-2xl border border-stone-300/90 bg-white p-3.5 shadow-xs">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-mono text-[11px] font-semibold text-stone-800 leading-relaxed flex items-center justify-between">
          <div>
            <span className="text-stone-600">partner.niwasi.in</span>
            <span className="mx-1 text-stone-400">&gt;</span>
            <span className="text-stone-600">Dashboard</span>
            <span className="mx-1 text-stone-400">&gt;</span>
            <span className="text-indigo-800 font-bold">Master Control Panel</span>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* 1. Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            Master Database & Scrap Rates
          </h2>
          <p className="text-xs text-ink-muted">
            Maintain daily buy rates, scrap categories, and pickup schedule.
          </p>
        </div>
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800 border border-indigo-200 shrink-0">
          Database Synced
        </span>
      </div>

      {/* 2. Standard Tab Switcher */}
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-stone-200/80 p-1 text-center">
        <button
          type="button"
          onClick={() => setActiveTab('prices')}
          className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition ${
            activeTab === 'prices'
              ? 'bg-white text-ink shadow-xs'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <TrendingUp size={13} className={activeTab === 'prices' ? 'text-indigo-700' : ''} />
          <span>Rates ({masterItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition ${
            activeTab === 'catalog'
              ? 'bg-white text-ink shadow-xs'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Layers size={13} className={activeTab === 'catalog' ? 'text-indigo-700' : ''} />
          <span>Catalog</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('generators')}
          className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition ${
            activeTab === 'generators'
              ? 'bg-white text-ink shadow-xs'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Building2 size={13} className={activeTab === 'generators' ? 'text-indigo-700' : ''} />
          <span>Taxonomy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('slots')}
          className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition ${
            activeTab === 'slots'
              ? 'bg-white text-ink shadow-xs'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <CalendarDays size={13} className={activeTab === 'slots' ? 'text-indigo-700' : ''} />
          <span>Slots ({masterSlots.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: LIVE SCRAP RATES & INLINE PRICE EDITOR       */}
      {/* ==================================================== */}
      {activeTab === 'prices' && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Bulk Rate Adjustment Tool */}
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <ArrowUpDown size={13} className="text-indigo-700" />
                <span>Bulk Rate Revision</span>
              </span>
              <span className="text-[10px] text-ink-muted">Quick percentage delta</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bulkCategoryFilter}
                onChange={(e) => setBulkCategoryFilter(e.target.value)}
                className="flex-1 min-w-[130px] rounded-xl border border-stone-200 bg-stone-50/60 px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-indigo-600 focus:outline-none"
              >
                <option value="all">All Groups & Items</option>
                {allGroups.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                {['+5', '+10', '-5', '-10'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleApplyBulkAdjustment(Number(preset))}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-[11px] font-bold text-ink hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-200 active:scale-95 transition"
                  >
                    {preset}%
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Custom %"
                  value={bulkAdjustmentPercent}
                  onChange={(e) => setBulkAdjustmentPercent(e.target.value)}
                  className="w-20 rounded-xl border border-stone-200 bg-stone-50/60 px-2 py-1 text-xs font-mono font-bold text-ink focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleApplyBulkAdjustment()}
                  disabled={!bulkAdjustmentPercent || Number(bulkAdjustmentPercent) === 0}
                  className="rounded-xl bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Individual Item Rates Table */}
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-xs font-bold text-ink">
                Verified Buy Rates ({filteredItems.length} items)
              </span>
              <span className="text-[10px] text-ink-muted">Click rate to edit</span>
            </div>

            {/* Quick search inside rates */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter items by name or category..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-stone-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {filteredItems.map((item) => {
                const isEditing = priceEditingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 hover:bg-stone-50/60 rounded-lg px-1 transition"
                  >
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-[10px] text-ink-muted">
                        {item.wasteGroup || 'Dry Recyclables'} • {item.wasteCategory || 'General'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-ink">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-16 rounded-lg border-2 border-indigo-600 bg-white px-2 py-0.5 font-mono text-xs font-bold text-ink focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePriceEdit(item.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                            title="Save"
                          >
                            <Check size={13} strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriceEditingItemId(null)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartPriceEdit(item)}
                            className="rounded-lg bg-stone-100 px-2 py-1 font-mono text-xs font-bold text-emerald-800 hover:bg-indigo-50 hover:text-indigo-800 transition"
                            title="Click to edit price"
                          >
                            ₹{item.pricePerUnit}/{item.unit || 'kg'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartPriceEdit(item)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:text-ink hover:bg-stone-100"
                            title="Edit"
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Trail Toggle & Log */}
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-2">
            <button
              type="button"
              onClick={() => setShowAuditTrail(!showAuditTrail)}
              className="flex w-full items-center justify-between text-xs font-bold text-ink"
            >
              <span className="flex items-center gap-1.5">
                <History size={13} className="text-indigo-700" />
                <span>Price Revision Audit Ledger ({priceAuditLog.length})</span>
              </span>
              <span className="font-mono text-[10px] text-ink-muted">
                {showAuditTrail ? 'Hide Log ▲' : 'View Log ▼'}
              </span>
            </button>

            {showAuditTrail && (
              <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                {priceAuditLog.length === 0 ? (
                  <p className="text-[11px] text-ink-muted py-2 text-center">
                    No price changes logged yet in this session.
                  </p>
                ) : (
                  priceAuditLog.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-xl bg-stone-50 p-2 text-xs border border-stone-100"
                    >
                      <div>
                        <p className="font-semibold text-ink">{log.itemName}</p>
                        <p className="text-[10px] text-ink-muted font-mono">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-800">
                          {log.itemId === 'BULK' ? `${log.newPrice}% Delta` : `₹${log.newPrice}`}
                        </span>
                        {log.oldPrice > 0 && (
                          <p className="font-mono text-[9px] text-stone-400 line-through">
                            ₹{log.oldPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: WASTE CATALOG MASTER (Taxonomy & Add Items)  */}
      {/* ==================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div>
                <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
                  Scrap Taxonomy & Item Catalog
                </h3>
                <p className="text-[10px] text-ink-muted">
                  Organized by Group &gt; Category &gt; Item
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-800 transition active:scale-95"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedGroupFilter('all')}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  selectedGroupFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-ink-muted hover:text-ink'
                }`}
              >
                All ({masterItems.length})
              </button>
              {allGroups.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroupFilter(grp)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    selectedGroupFilter === grp
                      ? 'bg-indigo-700 text-white'
                      : 'bg-stone-100 text-ink-muted hover:text-ink'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-stone-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Catalog Items List */}
            <div className="space-y-1.5 pt-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50/40 p-2.5 text-xs hover:bg-stone-50"
                >
                  <div>
                    <span className="font-semibold text-ink">{item.name}</span>
                    <span className="ml-2 rounded-md bg-stone-200/70 px-1.5 py-0.5 font-mono text-[9px] text-ink-muted">
                      {item.wasteCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{item.pricePerUnit}/{item.unit || 'kg'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Item Modal */}
          {isAddItemModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
              <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-heading text-xs font-bold text-ink">Add New Waste Item</h3>
                  <button onClick={() => setIsAddItemModalOpen(false)}>
                    <X size={15} className="text-stone-400 hover:text-ink" />
                  </button>
                </div>

                <form onSubmit={handleAddNewItem} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cardboard Grade A"
                      value={newItemForm.name}
                      onChange={(e) => setNewItemForm((p) => ({ ...p, name: e.target.value }))}
                      className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Waste Group
                      </label>
                      <select
                        value={newItemForm.wasteGroup}
                        onChange={(e) =>
                          setNewItemForm((p) => ({ ...p, wasteGroup: e.target.value }))
                        }
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="Dry Recyclables">Dry Recyclables</option>
                        <option value="Metals">Metals</option>
                        <option value="E-Waste">E-Waste</option>
                        <option value="Hazardous Dry">Hazardous Dry</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paper & Cardboard"
                        value={newItemForm.wasteCategory}
                        onChange={(e) =>
                          setNewItemForm((p) => ({ ...p, wasteCategory: e.target.value }))
                        }
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Unit
                      </label>
                      <select
                        value={newItemForm.unit}
                        onChange={(e) => setNewItemForm((p) => ({ ...p, unit: e.target.value }))}
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="kg">kg (Kilogram)</option>
                        <option value="piece">piece</option>
                        <option value="bundle">bundle</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Rate (₹ / Unit) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        required
                        value={newItemForm.pricePerUnit}
                        onChange={(e) =>
                          setNewItemForm((p) => ({ ...p, pricePerUnit: e.target.value }))
                        }
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs font-mono font-bold focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddItemModalOpen(false)}
                      className="flex-1 rounded-xl border border-stone-200 py-2 font-semibold text-ink-muted hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-indigo-700 py-2 font-bold text-white hover:bg-indigo-800"
                    >
                      Save to Master
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: GENERATOR TAXONOMY (3 Canonical Categories)  */}
      {/* ==================================================== */}
      {activeTab === 'generators' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-3">
            <div className="border-b border-stone-100 pb-2">
              <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
                Generator Classification (3 Canonical Categories)
              </h3>
              <p className="text-[10px] text-ink-muted">
                Family (Households), Business (Commercial), Public Spaces
              </p>
            </div>

            {/* Category Cards */}
            <div className="space-y-2.5">
              {generatorCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/40 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color || '#2C5F74' }}
                      />
                      <h4 className="font-heading text-xs font-bold text-ink">{cat.name}</h4>
                    </div>
                    <span className="rounded-md bg-stone-200/80 px-2 py-0.5 font-mono text-[9px] font-semibold text-ink-muted">
                      {(cat.subCategories || []).length} Sub-Types
                    </span>
                  </div>

                  <p className="text-[11px] text-ink-muted leading-tight">{cat.description}</p>

                  {/* Sub-categories */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 pt-0.5">
                    {(cat.subCategories || []).map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between rounded-lg border border-stone-200/80 bg-white p-2 text-xs shadow-2xs"
                      >
                        <div>
                          <p className="font-semibold text-ink">{sub.name}</p>
                          <p className="font-mono text-[10px] text-ink-muted">
                            {sub.estimatedVolumeKg}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubCategory(cat.id, sub.id)}
                          className="flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Sub-category form */}
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/60 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                Add Sub-Category to Taxonomy
              </span>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                <select
                  value={selectedCatForSub}
                  onChange={(e) => setSelectedCatForSub(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink focus:border-indigo-600 focus:outline-none"
                >
                  {generatorCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Sub-Category Name (e.g. Clinic)"
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-2 py-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                />

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Est. Volume (e.g. 50 kg)"
                    value={newSubCatVolume}
                    onChange={(e) => setNewSubCatVolume(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-200 bg-white px-2 py-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubCategory(selectedCatForSub)}
                    className="flex items-center gap-1 rounded-xl bg-indigo-700 px-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-800 transition active:scale-95"
                  >
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: MASTER SLOTS & SCHEDULE CONTROLLER            */}
      {/* ==================================================== */}
      {activeTab === 'slots' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div>
                <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
                  Master Pickup Slots Schedule
                </h3>
                <p className="text-[10px] text-ink-muted">
                  Controls slot availability for Flow 1 (Kabad) and Flow 2 (Staff)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSlotModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-800 transition active:scale-95"
              >
                <Plus size={13} />
                <span>Add Slot</span>
              </button>
            </div>

            {/* Slots List */}
            <div className="space-y-2 pt-0.5">
              {masterSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50/50 p-2.5 text-xs hover:bg-stone-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                      <Clock size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">
                          {slot.day}, {slot.formattedDate || slot.date}
                        </span>
                        <span className="rounded-md bg-stone-200/70 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ink-muted">
                          {slot.slotName}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] text-indigo-800 font-semibold">
                        {slot.timeRange}
                        {slot.technician && ` • ${slot.technician}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSlotStatus(slot.id)}
                      className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold border transition ${
                        (slot.status || '').toLowerCase() === 'available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {(slot.status || '').toLowerCase() === 'available' ? 'Available' : 'Full'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Slot Modal */}
          {isAddSlotModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
              <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-heading text-xs font-bold text-ink">Add Master Pickup Slot</h3>
                  <button onClick={() => setIsAddSlotModalOpen(false)}>
                    <X size={15} className="text-stone-400 hover:text-ink" />
                  </button>
                </div>

                <form onSubmit={handleAddSlot} className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Day of Week *
                      </label>
                      <select
                        value={newSlotForm.day}
                        onChange={(e) => setNewSlotForm((p) => ({ ...p, day: e.target.value }))}
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newSlotForm.date}
                        onChange={(e) => setNewSlotForm((p) => ({ ...p, date: e.target.value }))}
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Slot Name
                      </label>
                      <input
                        type="text"
                        placeholder="Morning Slot"
                        value={newSlotForm.slotName}
                        onChange={(e) => setNewSlotForm((p) => ({ ...p, slotName: e.target.value }))}
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">
                        Time Range *
                      </label>
                      <input
                        type="text"
                        placeholder="8:00 AM - 11:00 AM"
                        value={newSlotForm.timeRange}
                        onChange={(e) => setNewSlotForm((p) => ({ ...p, timeRange: e.target.value }))}
                        className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs font-mono font-semibold focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">
                      Assigned Field Technician
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ajay Paswan"
                      value={newSlotForm.technician}
                      onChange={(e) => setNewSlotForm((p) => ({ ...p, technician: e.target.value }))}
                      className="mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddSlotModalOpen(false)}
                      className="flex-1 rounded-xl border border-stone-200 py-2 font-semibold text-ink-muted hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-indigo-700 py-2 font-bold text-white hover:bg-indigo-800"
                    >
                      Save Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
