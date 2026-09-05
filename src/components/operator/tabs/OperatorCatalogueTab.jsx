import { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { addMasterItem, deleteMasterItem } from '../../../db/operations';
import WasteIcon from '../../shared/WasteIcon';

export default function OperatorCatalogueTab({
  masterItems = [],
  wasteGroups = [],
  wasteCategories = [],
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Filter active groups that actually have items
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

  // Categories available for currently selected group (or all)
  const availableCategories = useMemo(() => {
    if (selectedGroup === 'all') return wasteCategories;
    const grp = activeGroups.find((g) => g.name === selectedGroup || g.id === selectedGroup);
    return wasteCategories.filter((c) => c.groupId === grp?.id || c.groupId === selectedGroup);
  }, [wasteCategories, activeGroups, selectedGroup]);

  // New item form
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    categoryId: 'WC-01',
    unit: 'kg',
    pricePerUnit: 12,
  });

  const filteredItems = useMemo(() => {
    return masterItems.filter((item) => {
      // Group filter
      if (selectedGroup !== 'all') {
        const matchGroup =
          item.wasteGroup === selectedGroup ||
          item.groupId === selectedGroup;
        if (!matchGroup) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const matchCat =
          item.categoryId === selectedCategory ||
          item.wasteCategory === selectedCategory;
        if (!matchCat) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchCat = (item.wasteCategory || '').toLowerCase().includes(q);
        const matchId = (item.id || '').toLowerCase().includes(q);
        return matchName || matchCat || matchId;
      }
      return true;
    });
  }, [masterItems, selectedGroup, selectedCategory, searchQuery]);

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newItemForm.name.trim()) return;

    addMasterItem({
      name: newItemForm.name.trim(),
      categoryId: newItemForm.categoryId,
      unit: newItemForm.unit,
      pricePerUnit: Number(newItemForm.pricePerUnit) || 0,
    });

    setNewItemForm({
      name: '',
      categoryId: 'WC-01',
      unit: 'kg',
      pricePerUnit: 12,
    });
    setIsAddItemModalOpen(false);
  };

  const handleDelete = (itemId, name) => {
    if (window.confirm(`Remove "${name}" from master catalogue?`)) {
      deleteMasterItem(itemId);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header: Clean title only */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <h1 className="font-heading text-xl font-bold text-ink tracking-tight">
            Kabaad Catalogue
          </h1>
          <p className="font-mono text-xs text-stone-500 mt-0.5">
            {filteredItems.length} items listed across {activeGroups.length} material groups
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddItemModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Catalogue Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, code, or category"
            className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2 pl-9 pr-8 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition"
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

        {/* Group Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
          <span className="text-[11px] font-bold text-stone-500 uppercase font-mono mr-1">Group:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedGroup('all');
              setSelectedCategory('all');
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition shrink-0 ${
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
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition shrink-0 ${
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

        {/* Category Filter Chips (if available) */}
        {availableCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-100 text-xs font-medium scrollbar-none">
            <span className="text-[11px] font-bold text-stone-500 uppercase font-mono mr-1">Cat:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold transition shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <WasteIcon token={cat.icon || cat.name} size={12} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Catalogue Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] font-bold text-stone-600">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Item Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Group</th>
                <th className="px-5 py-3">Unit</th>
                <th className="px-5 py-3 text-right">Current Rate</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition">
                    <td className="px-5 py-3 font-mono font-bold text-stone-500">
                      {item.id}
                    </td>

                    <td className="px-5 py-3 font-heading font-bold text-ink">
                      {item.name}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-stone-700">
                        <WasteIcon token={item.categoryIcon || item.wasteCategory} size={14} className="text-[#1E7A46]" />
                        <span>{item.wasteCategory || 'Uncategorized'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3 font-mono text-[11px] text-stone-500">
                      {item.wasteGroup || 'Dry Waste'}
                    </td>

                    <td className="px-5 py-3 font-mono text-stone-500 uppercase">
                      {item.unit || 'kg'}
                    </td>

                    <td className="px-5 py-3 font-mono font-bold text-[#1E7A46] text-right">
                      {formatCurrency(item.pricePerUnit || 0)}/{item.unit || 'kg'}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="rounded-lg p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-stone-500">
                    No catalogue items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-heading text-base font-bold text-ink">
                Add Catalogue Item
              </h2>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-ink">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  placeholder="e.g. Copper Wire (Insulated)"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-[#1E7A46] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Category</label>
                <select
                  value={newItemForm.categoryId}
                  onChange={(e) => setNewItemForm({ ...newItemForm, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-[#1E7A46] focus:bg-white focus:outline-none"
                >
                  {wasteCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.groupId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-ink">Unit</label>
                  <select
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-[#1E7A46] focus:bg-white focus:outline-none font-mono"
                  >
                    <option value="kg">kg</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-ink">Base Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={newItemForm.pricePerUnit}
                    onChange={(e) =>
                      setNewItemForm({ ...newItemForm, pricePerUnit: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono font-bold text-ink focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 font-bold text-white hover:bg-primary-dark transition shadow-xs"
                >
                  Save Item
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 font-bold text-ink hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
