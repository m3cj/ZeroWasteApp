import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Scale,
  X,
  Tag,
} from 'lucide-react';
import WasteIcon from './WasteIcon';
import { formatCurrency } from '../../utils/formatters';

/**
 * Standardized Kabaad Item Entry Component
 * Used across multiple roles (Technician Purchase Flow, Staff Desk, Generator Entry)
 */
export default function KuraItemEntry({
  masterItems = [],
  wasteGroups = [],
  wasteCategories = [],
  items = [],
  onAddItem,
  onRemoveItem,
  title = 'Kabaad Entry',
}) {
  // 1. Groups: Filter out empty groups (e.g. Wet Waste, Sanitary & Medical Waste with 0 items)
  const displayGroups = useMemo(() => {
    if (wasteGroups && wasteGroups.length > 0) {
      return wasteGroups.filter((g) => {
        return masterItems.some(
          (i) =>
            i.wasteGroup === g.name ||
            i.groupId === g.id ||
            i.groupId === g.name
        );
      });
    }

    // Fallback: derive unique groups from masterItems
    const groupMap = new Map();
    masterItems.forEach((i) => {
      const gName = i.wasteGroup || 'Dry Waste';
      if (!groupMap.has(gName)) {
        groupMap.set(gName, {
          id: i.groupId || gName,
          name: gName,
          icon: i.groupIcon || gName,
        });
      }
    });
    return Array.from(groupMap.values());
  }, [wasteGroups, masterItems]);

  const [selectedGroup, setSelectedGroup] = useState(
    displayGroups[0]?.name || 'Dry Waste'
  );

  // Keep selectedGroup valid if displayGroups updates
  useEffect(() => {
    if (displayGroups.length > 0) {
      const exists = displayGroups.some(
        (g) => g.name === selectedGroup || g.id === selectedGroup
      );
      if (!exists) {
        setSelectedGroup(displayGroups[0].name);
      }
    }
  }, [displayGroups, selectedGroup]);

  // 2. Categories: Show categories belonging to selectedGroup that have items
  const displayCategories = useMemo(() => {
    const currentGroupObj = displayGroups.find(
      (g) => g.name === selectedGroup || g.id === selectedGroup
    );
    const groupId = currentGroupObj?.id;
    const groupName = currentGroupObj?.name || selectedGroup;

    if (wasteCategories && wasteCategories.length > 0) {
      const matchingCats = wasteCategories.filter((c) => {
        const belongsToGroup =
          c.groupId === groupId ||
          c.groupId === groupName ||
          masterItems.some(
            (i) =>
              (i.categoryId === c.id || i.wasteCategory === c.name) &&
              (i.wasteGroup === groupName || i.groupId === groupId)
          );
        const hasItems = masterItems.some(
          (i) => i.categoryId === c.id || i.wasteCategory === c.name
        );
        return belongsToGroup && hasItems;
      });

      if (matchingCats.length > 0) {
        return matchingCats;
      }
    }

    // Fallback: derive categories from masterItems for this group
    const inGroup = masterItems.filter(
      (i) =>
        (i.wasteGroup || 'Dry Waste') === groupName ||
        (i.groupId && i.groupId === groupId)
    );
    const catMap = new Map();
    inGroup.forEach((i) => {
      const cName = i.wasteCategory || 'Plastic';
      if (!catMap.has(cName)) {
        catMap.set(cName, {
          id: i.categoryId || cName,
          groupId: groupId || groupName,
          name: cName,
          icon: i.categoryIcon || cName,
        });
      }
    });
    return Array.from(catMap.values());
  }, [displayGroups, selectedGroup, wasteCategories, masterItems]);

  const [selectedCategory, setSelectedCategory] = useState(
    displayCategories[0]?.name || ''
  );

  // Keep selectedCategory in sync when selectedGroup or displayCategories change
  useEffect(() => {
    if (displayCategories.length > 0) {
      const exists = displayCategories.some(
        (c) => c.name === selectedCategory || c.id === selectedCategory
      );
      if (!exists) {
        setSelectedCategory(displayCategories[0].name);
      }
    } else {
      setSelectedCategory('');
    }
  }, [displayCategories, selectedCategory]);

  // 3. Available items for selectedGroup & selectedCategory
  const availableItems = useMemo(() => {
    const currentGroupObj = displayGroups.find(
      (g) => g.name === selectedGroup || g.id === selectedGroup
    );
    const groupName = currentGroupObj?.name || selectedGroup;
    const groupId = currentGroupObj?.id;

    const currentCatObj = displayCategories.find(
      (c) => c.name === selectedCategory || c.id === selectedCategory
    );
    const catName = currentCatObj?.name || selectedCategory;
    const catId = currentCatObj?.id;

    return masterItems.filter((i) => {
      const matchesGroup =
        !groupName ||
        i.wasteGroup === groupName ||
        (groupId && i.groupId === groupId);
      const matchesCategory =
        !catName ||
        i.wasteCategory === catName ||
        (catId && i.categoryId === catId);
      return matchesGroup && matchesCategory;
    });
  }, [masterItems, displayGroups, selectedGroup, displayCategories, selectedCategory]);

  const [selectedItemId, setSelectedItemId] = useState(
    availableItems[0]?.id || masterItems[0]?.id || ''
  );
  const [itemWeight, setItemWeight] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);

  // Sync selected item when availableItems change
  useEffect(() => {
    if (availableItems.length > 0) {
      const exists = availableItems.some((i) => i.id === selectedItemId);
      if (!exists) {
        setSelectedItemId(availableItems[0].id);
      }
    }
  }, [availableItems, selectedItemId]);

  const currentItem = useMemo(() => {
    return (
      masterItems.find((itm) => itm.id === selectedItemId) ||
      availableItems[0] ||
      masterItems[0] ||
      null
    );
  }, [masterItems, selectedItemId, availableItems]);

  // Autocomplete Search logic
  const searchFilteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return masterItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.wasteCategory && i.wasteCategory.toLowerCase().includes(q)) ||
        (i.wasteGroup && i.wasteGroup.toLowerCase().includes(q))
    );
  }, [masterItems, searchQuery]);

  const handleSelectFromSearch = (item) => {
    if (item.wasteGroup) setSelectedGroup(item.wasteGroup);
    if (item.wasteCategory) setSelectedCategory(item.wasteCategory);
    setSelectedItemId(item.id);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleGroupSelect = (grpName) => {
    setSelectedGroup(grpName);
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
  };

  // Quick weight increment buttons: only +0.5, +1, +5
  const quickWeights = [0.5, 1, 5];

  const handleQuickAdd = (increment) => {
    const current = parseFloat(itemWeight) || 0;
    const next = Math.round((current + increment) * 10) / 10;
    setItemWeight(String(next));
  };

  const handleAdd = () => {
    const weightNum = Number(itemWeight || 0);
    if (!currentItem || weightNum <= 0) return;

    const rate = Number(currentItem.pricePerUnit || 0);
    const subtotal = Math.round(weightNum * rate * 100) / 100;

    const cartRow = {
      itemId: currentItem.id,
      name: currentItem.name,
      wasteGroup: currentItem.wasteGroup || selectedGroup,
      wasteCategory: currentItem.wasteCategory || selectedCategory,
      weight: weightNum,
      unit: currentItem.unit || 'kg',
      pricePerUnit: rate,
      subtotal,
    };

    if (onAddItem) {
      onAddItem(cartRow);
    }
    setItemWeight('');
  };

  const cartGrandTotal = useMemo(() => {
    return (items || []).reduce((sum, row) => sum + Number(row.subtotal || 0), 0);
  }, [items]);

  const totalWeight = useMemo(() => {
    return (items || []).reduce((sum, row) => sum + Number(row.weight || 0), 0);
  }, [items]);

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Main Single Card Container */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3.5">
        {/* 1. Header: ONLY "Kabaad Entry", no subtitle, no live rates */}
        <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
            <Scale size={15} />
          </div>
          <h3 className="font-heading text-sm font-bold text-ink">{title}</h3>
        </div>

        {/* 2. Quick Search: Placeholder "Search items" */}
        <div className="relative">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search size={14} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search items"
              value={searchQuery}
              onFocus={() => setShowSearchResults(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-9 pr-8 py-2 text-xs text-ink placeholder:text-stone-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchResults && searchFilteredItems.length > 0 && (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white p-1 shadow-lg divide-y divide-stone-50">
              {searchFilteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFromSearch(item)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition hover:bg-emerald-50/60"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-ink truncate">{item.name}</p>
                    <p className="text-[10px] text-ink-muted">
                      {item.wasteGroup} • {item.wasteCategory}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-800 shrink-0">
                    ₹{item.pricePerUnit}/{item.unit || 'kg'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Group: Scrollable icon + small title cards (empty groups filtered out) */}
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Group
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {displayGroups.map((grp) => {
              const isSelected =
                selectedGroup === grp.name || selectedGroup === grp.id;
              return (
                <button
                  key={grp.id || grp.name}
                  type="button"
                  onClick={() => handleGroupSelect(grp.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl shrink-0 cursor-pointer transition-all active:scale-95 select-none ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700/20'
                      : 'bg-stone-50 border border-stone-200/90 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  <WasteIcon
                    name={grp.icon || grp.name}
                    size={15}
                    className={isSelected ? 'text-emerald-200' : 'text-stone-500'}
                  />
                  <span className="text-xs font-bold whitespace-nowrap">
                    {grp.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Category: Scrollable icons list */}
        {displayCategories.length > 0 && (
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Category
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {displayCategories.map((cat) => {
                const isSelected =
                  selectedCategory === cat.name || selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer transition-all active:scale-95 select-none text-[11px] font-semibold ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-50 border border-stone-200/80 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <WasteIcon
                      name={cat.icon || cat.name}
                      size={13}
                      className={isSelected ? 'text-emerald-200' : 'text-stone-500'}
                    />
                    <span className="whitespace-nowrap">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Kabaad Item: Dropdown with ONLY names, no price in option string */}
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Kabaad Item
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-semibold text-ink focus:border-emerald-600 focus:outline-none transition-colors"
          >
            {availableItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Selected Item Banner with Fetched Rate, Weight Input, and Add Item */}
        {currentItem && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading text-xs font-bold text-ink">
                  {currentItem.name}
                </span>
                <p className="text-[10px] text-ink-muted font-medium">
                  {currentItem.wasteCategory}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-extrabold text-emerald-800">
                  ₹{currentItem.pricePerUnit}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  /{currentItem.unit || 'kg'}
                </span>
              </div>
            </div>

            {/* Weight Input Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Enter weight (e.g. 5)"
                  value={itemWeight}
                  onChange={(e) => setItemWeight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-ink placeholder:font-normal placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[11px] font-bold text-stone-400">
                  {currentItem.unit || 'kg'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!itemWeight || Number(itemWeight) <= 0}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            {/* Quick Increment Options: ONLY +0.5, +1, +5 */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[9px] font-bold uppercase text-stone-400 shrink-0 mr-0.5">
                Quick:
              </span>
              {quickWeights.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleQuickAdd(w)}
                  className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-stone-700 transition hover:border-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 active:scale-95 shadow-2xs cursor-pointer"
                >
                  +{w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. Added Kabaad Items Cart */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="text-xs font-bold text-ink">
              Added Kabaad Items ({items.length})
            </span>
            <span className="font-mono text-xs font-bold text-stone-600">
              Total Weight: {totalWeight.toFixed(1)} kg
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-ink truncate">{item.name}</p>
                  <p className="text-[10px] font-mono text-ink-muted">
                    {item.weight} {item.unit} × ₹{item.pricePerUnit}/{item.unit}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    {formatCurrency(item.subtotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem && onRemoveItem(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total Footer */}
          <div className="mt-2 flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 p-2.5">
            <span className="text-xs font-bold text-ink">Estimated Payout</span>
            <span className="font-mono text-sm font-extrabold text-emerald-800">
              {formatCurrency(cartGrandTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
