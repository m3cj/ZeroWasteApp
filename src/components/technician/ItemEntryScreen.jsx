import { useState, useMemo, useEffect } from 'react';
import {
  Trash2,
  Plus,
  ArrowRight,
  ShoppingCart,
  Scale,
  Search,
  BadgeCheck,
  X,
} from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import StickyBottomBar from '../shared/StickyBottomBar';
import { formatCurrency } from '../../utils/formatters';

export default function ItemEntryScreen({
  generator,
  items = [],
  cart = [],
  selectedItemId,
  setSelectedItemId,
  itemWeight,
  setItemWeight,
  onAddToCart,
  onRemoveCartItem,
  onBack,
  onReviewConfirm,
  grandTotal = 0,
}) {
  // Extract groups and categories
  const allGroups = useMemo(() => {
    return [...new Set(items.map((i) => i.wasteGroup || 'Dry Recyclables'))];
  }, [items]);

  const currentItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || items[0] || null,
    [items, selectedItemId]
  );

  const [selectedGroup, setSelectedGroup] = useState(
    currentItem?.wasteGroup || allGroups[0] || 'Dry Recyclables'
  );

  const availableCategories = useMemo(() => {
    const inGroup = items.filter((i) => (i.wasteGroup || 'Dry Recyclables') === selectedGroup);
    return [...new Set(inGroup.map((i) => i.wasteCategory || 'General'))];
  }, [items, selectedGroup]);

  const [selectedCategory, setSelectedCategory] = useState(
    currentItem?.wasteCategory || availableCategories[0] || ''
  );

  const availableItems = useMemo(() => {
    return items.filter(
      (i) =>
        (i.wasteGroup || 'Dry Recyclables') === selectedGroup &&
        (i.wasteCategory || 'General') === selectedCategory
    );
  }, [items, selectedGroup, selectedCategory]);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchFilteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.wasteCategory && i.wasteCategory.toLowerCase().includes(q)) ||
        (i.wasteGroup && i.wasteGroup.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const handleSelectFromSearch = (item) => {
    setSelectedItemId(item.id);
    setSelectedGroup(item.wasteGroup || 'Dry Recyclables');
    setSelectedCategory(item.wasteCategory || 'General');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleGroupChange = (newGroup) => {
    setSelectedGroup(newGroup);
    const inNewGroup = items.filter((i) => (i.wasteGroup || 'Dry Recyclables') === newGroup);
    const newCats = [...new Set(inNewGroup.map((i) => i.wasteCategory || 'General'))];
    const newCat = newCats[0] || '';
    setSelectedCategory(newCat);
    const firstItem = inNewGroup.find((i) => (i.wasteCategory || 'General') === newCat) || inNewGroup[0];
    if (firstItem) setSelectedItemId(firstItem.id);
  };

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const inNewCat = items.filter(
      (i) =>
        (i.wasteGroup || 'Dry Recyclables') === selectedGroup &&
        (i.wasteCategory || 'General') === newCategory
    );
    if (inNewCat[0]) setSelectedItemId(inNewCat[0].id);
  };

  useEffect(() => {
    if (currentItem) {
      if (currentItem.wasteGroup) setSelectedGroup(currentItem.wasteGroup);
      if (currentItem.wasteCategory) setSelectedCategory(currentItem.wasteCategory);
    }
  }, [selectedItemId]);

  const price = currentItem ? Number(currentItem.pricePerUnit || 0) : 0;
  const weightNum = Number(itemWeight || 0);
  const subtotal = weightNum * price;

  const quickWeights = [1, 2, 5, 10, 20];

  const handleAdd = () => {
    if (weightNum <= 0 || !currentItem) return;
    onAddToCart();
  };

  return (
    <div className="space-y-3.5 pb-24 animate-fade-in">
      {/* 1. Compact Context Header */}
      <div className="flex items-center justify-between px-1">
        <div className="truncate">
          <span className="font-heading text-sm font-bold text-ink truncate">
            {generator?.ownerName}
          </span>
          <span className="text-xs text-ink-muted ml-2 font-mono">
            {generator?.communityName}
          </span>
        </div>
        <CategoryTag category={generator?.category} showIcon={false} size="xs" />
      </div>

      {/* 2. Sleek Waste Item Entry Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
        {/* Quick Search */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search waste item to auto-fill..."
            value={searchQuery}
            onFocus={() => setShowSearchResults(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/80 py-2 pl-9 pr-8 text-xs font-medium text-ink placeholder-stone-400 focus:bg-white focus:border-route focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-stone-400 hover:text-ink"
            >
              <X size={13} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSearchResults && searchFilteredItems.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg p-1 space-y-0.5">
              {searchFilteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFromSearch(item)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-50 transition flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-ink truncate">{item.name}</span>
                  <span className="font-mono font-bold text-ledger text-xs ml-2 shrink-0">
                    ₹{Number(item.pricePerUnit).toFixed(2)}/{item.unit}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3 Hierarchical Selectors (Group, Category, Type) */}
        <div className="space-y-2 pt-0.5">
          {/* Row 1: Waste Group & Category */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Waste Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full mt-1 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-semibold text-ink focus:border-route focus:outline-none"
              >
                {allGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Waste Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full mt-1 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-semibold text-ink focus:border-route focus:outline-none"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Waste Type (Exact Item) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Waste Type
            </label>
            <select
              value={selectedItemId || ''}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full mt-1 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-bold text-ink focus:border-route focus:outline-none"
            >
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate Display + Weight Input + Subtotal */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Master Rate */}
          <div className="rounded-xl border border-ledger/25 bg-ledger-soft/50 p-2 text-center flex flex-col justify-center">
            <span className="text-[9px] font-bold uppercase text-ledger tracking-wider flex items-center justify-center gap-0.5">
              <BadgeCheck size={10} /> Rate
            </span>
            <span className="font-mono text-sm font-bold text-ledger mt-0.5">
              ₹{price.toFixed(2)}
              <span className="text-[10px] font-normal">/{currentItem?.unit || 'kg'}</span>
            </span>
          </div>

          {/* Weight Input */}
          <div>
            <label className="text-[9px] font-bold uppercase text-ink-muted tracking-wider block mb-0.5">
              Weight ({currentItem?.unit || 'kg'})
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="0.0"
              value={itemWeight}
              onChange={(e) => setItemWeight(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white p-2 text-center font-mono text-sm font-bold text-ink focus:border-route focus:outline-none"
            />
          </div>

          {/* Item Subtotal */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-center flex flex-col justify-center">
            <span className="text-[9px] font-bold uppercase text-ink-muted tracking-wider">
              Subtotal
            </span>
            <span className="font-mono text-sm font-bold text-ink mt-0.5">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        {/* Quick Add Chips */}
        <div className="flex items-center gap-1 pt-0.5">
          <span className="text-[10px] text-ink-muted font-medium mr-1">Quick:</span>
          {quickWeights.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                const cur = Number(itemWeight || 0);
                setItemWeight((cur + w).toFixed(1));
              }}
              className="flex-1 rounded-lg border border-stone-200 bg-stone-50 py-1 text-center font-mono text-[11px] font-semibold text-ink hover:bg-stone-100 active:scale-95 transition"
            >
              +{w}
            </button>
          ))}
          {itemWeight && (
            <button
              type="button"
              onClick={() => setItemWeight('')}
              className="rounded-lg px-2 py-1 text-[10px] font-bold text-stamp hover:bg-stamp-soft"
            >
              Clear
            </button>
          )}
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={weightNum <= 0}
          className="w-full rounded-xl bg-route py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-route-dark active:scale-[0.99] disabled:bg-stone-200 disabled:text-stone-400 flex items-center justify-center gap-1.5"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add to Cart</span>
        </button>
      </div>

      {/* 3. Scrap Cart List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart size={13} className="text-route" />
            <span>Scrap Cart</span>
          </span>
          <span className="font-mono text-xs text-ink-muted">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white/60 p-4 text-center text-xs text-ink-muted">
            No items in cart yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {cart.map((row, idx) => (
              <div
                key={`${row.itemId}-${idx}`}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-2.5 shadow-xs"
              >
                <div className="truncate mr-2">
                  <p className="font-bold text-xs text-ink truncate">{row.name}</p>
                  <p className="font-mono text-[11px] text-ink-muted">
                    {row.weight} kg × ₹{Number(row.pricePerUnit).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono text-xs font-bold text-ink">
                    {formatCurrency(row.subtotal)}
                  </span>
                  <button
                    onClick={() => onRemoveCartItem(idx)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 text-stone-500 hover:bg-stamp hover:text-white transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Sticky Bottom Bar */}
      <StickyBottomBar>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted">
            Grand Total
          </p>
          <p className="font-mono text-lg font-bold text-ink">
            {formatCurrency(grandTotal)}
          </p>
        </div>

        <button
          onClick={onReviewConfirm}
          disabled={cart.length === 0}
          className="btn-primary w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:bg-stone-300 disabled:text-stone-500 flex items-center gap-1.5"
        >
          <span>Review & Confirm</span>
          <ArrowRight size={14} />
        </button>
      </StickyBottomBar>
    </div>
  );
}
