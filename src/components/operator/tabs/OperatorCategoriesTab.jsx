import { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Layers,
  Package,
  Boxes,
} from 'lucide-react';
import WasteIcon from '../../shared/WasteIcon';
import { addWasteCategory, updateWasteCategory, deleteWasteCategory } from '../../../db/operations';

const AVAILABLE_CATEGORY_ICONS = [
  { id: 'Layers', label: 'Layers (Plastic)' },
  { id: 'FileText', label: 'Paper' },
  { id: 'Footprints', label: 'Leather' },
  { id: 'Hammer', label: 'Metal' },
  { id: 'Shirt', label: 'Cloth' },
  { id: 'Trees', label: 'Wood' },
  { id: 'Wine', label: 'Glass' },
  { id: 'Scissors', label: 'Hair' },
  { id: 'Cpu', label: 'Electronics' },
  { id: 'BatteryCharging', label: 'Battery' },
  { id: 'Package', label: 'Package' },
  { id: 'Boxes', label: 'Boxes' },
];

export default function OperatorCategoriesTab({
  wasteCategories = [],
  wasteGroups = [],
  masterItems = [],
}) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    groupId: '',
    name: '',
    icon: 'Layers',
  });

  // Calculate master items count per category
  const categoryItemCounts = useMemo(() => {
    const map = {};
    for (const cat of wasteCategories) {
      const itemsInCat = masterItems.filter(
        (i) => i.categoryId === cat.id || i.wasteCategory === cat.name
      );
      map[cat.id] = itemsInCat.length;
    }
    return map;
  }, [wasteCategories, masterItems]);

  // Group lookup map
  const groupMap = useMemo(() => {
    return Object.fromEntries(wasteGroups.map((g) => [g.id, g]));
  }, [wasteGroups]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return wasteCategories.filter((cat) => {
      if (selectedGroupFilter !== 'all' && cat.groupId !== selectedGroupFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const parentGroupName = groupMap[cat.groupId]?.name || '';
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.id.toLowerCase().includes(q) ||
          parentGroupName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [wasteCategories, selectedGroupFilter, searchQuery, groupMap]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    const nextNum = wasteCategories.length + 1;
    const generatedId = `WC-${String(nextNum).padStart(2, '0')}`;
    setFormData({
      id: generatedId,
      groupId: selectedGroupFilter !== 'all' ? selectedGroupFilter : (wasteGroups[0]?.id || 'WG-01'),
      name: '',
      icon: 'Layers',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      groupId: cat.groupId,
      name: cat.name,
      icon: cat.icon || 'Layers',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setErrorMsg('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    if (!formData.groupId) {
      setErrorMsg('Parent Kabaad Group is required.');
      return;
    }

    if (editingCategory) {
      updateWasteCategory(editingCategory.id, {
        name: formData.name,
        groupId: formData.groupId,
        icon: formData.icon,
      });
      setSuccessMsg(`Category "${formData.name}" updated successfully!`);
    } else {
      if (wasteCategories.some((c) => c.id === formData.id.trim())) {
        setErrorMsg(`Category ID "${formData.id}" already exists. Please choose a unique ID.`);
        return;
      }
      addWasteCategory({
        id: formData.id,
        groupId: formData.groupId,
        name: formData.name,
        icon: formData.icon,
      });
      setSuccessMsg(`Category "${formData.name}" added successfully!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleDelete = (cat) => {
    const count = categoryItemCounts[cat.id] || 0;
    if (count > 0) {
      if (
        !window.confirm(
          `Warning: Category "${cat.name}" currently contains ${count} items in the master catalogue. Deleting it may leave these items without a category. Proceed anyway?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete category "${cat.name}" (${cat.id})?`)) {
        return;
      }
    }

    deleteWasteCategory(cat.id);
    setSuccessMsg(`Category "${cat.name}" was deleted.`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary">
              <FolderTree size={13} />
              Taxonomy Classification
            </span>
            <span className="text-xs font-mono text-stone-500">
              {wasteCategories.length} Kabaad Categories
            </span>
          </div>
          <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-ink">
            Kabaad Category
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure material categories mapped to parent Kabaad Groups and scrap catalogue items
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition"
        >
          <Plus size={16} />
          <span>Add Kabaad Category</span>
        </button>
      </div>

      {/* Success Notice */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Parent Group Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedGroupFilter('all')}
          className={`shrink-0 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition ${
            selectedGroupFilter === 'all'
              ? 'bg-ink text-white shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          All Groups ({wasteCategories.length})
        </button>
        {wasteGroups.map((grp) => {
          const isSelected = selectedGroupFilter === grp.id;
          const count = wasteCategories.filter((c) => c.groupId === grp.id).length;
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => setSelectedGroupFilter(grp.id)}
              className={`shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs font-bold transition ${
                isSelected
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <WasteIcon name={grp.icon || grp.name} size={14} />
              <span>{grp.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Counter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category name, ID, or group..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/70 pl-10 pr-4 py-2 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <span className="text-xs font-mono text-stone-500 shrink-0">
          Showing {filteredCategories.length} of {wasteCategories.length} categories
        </span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const parentGroup = groupMap[cat.groupId] || { name: 'Unknown Group', icon: 'Boxes' };
          const itemCount = categoryItemCounts[cat.id] || 0;

          return (
            <div
              key={cat.id}
              className="group flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 group-hover:scale-105 transition-transform">
                      <WasteIcon name={cat.icon || cat.name} size={22} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-heading text-base font-bold text-ink truncate">
                        {cat.name}
                      </h2>
                      <span className="font-mono text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/70 inline-block mt-0.5">
                        {cat.id}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-ink transition"
                      title="Edit Category"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Parent Group Badge */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-400">
                    Parent Group:
                  </span>
                  <div className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-2 py-1 text-xs font-medium text-ink truncate">
                    <WasteIcon name={parentGroup.icon || parentGroup.name} size={13} className="text-primary shrink-0" />
                    <span className="truncate">{parentGroup.name}</span>
                  </div>
                </div>

                {/* Items in Category */}
                <div className="rounded-xl bg-stone-50 p-2.5 flex items-center justify-between font-mono text-xs">
                  <span className="text-[11px] text-stone-500 font-sans">Catalog Items:</span>
                  <span className="font-bold text-ink">{itemCount} items linked</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <FolderTree size={32} className="mx-auto text-stone-400 mb-2" />
            <p className="font-heading text-sm font-bold text-ink">No Kabaad Categories found</p>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search or select a different parent group filter.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Kabaad Category'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {editingCategory
                    ? 'Modify category name, parent group, or visual icon'
                    : 'Classify scrap items under a parent Kabaad Group'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-ink transition"
              >
                <X size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700">
                <AlertTriangle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Live Preview */}
            <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Live Card Preview
              </span>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <WasteIcon name={formData.icon || 'Layers'} size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-ink">
                    {formData.name || 'Category Name'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {formData.id || 'WC-XX'}
                    </span>
                    <span className="text-xs text-stone-500 font-sans">
                      Under: {groupMap[formData.groupId]?.name || 'Group'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-ink">Parent Kabaad Group *</label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                  >
                    {wasteGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-ink">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Plastic, Paper, Metal..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Category ID *</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  disabled={!!editingCategory}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  placeholder="e.g. WC-11"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono text-ink disabled:opacity-60 focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="mb-1.5 block font-bold text-ink">Visual Icon</label>
                <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                  {AVAILABLE_CATEGORY_ICONS.map((ico) => {
                    const isSelected = formData.icon === ico.id;
                    return (
                      <button
                        key={ico.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: ico.id })}
                        className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 border transition ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                        }`}
                      >
                        <WasteIcon name={ico.id} size={18} />
                        <span className="text-[10px] truncate max-w-full">{ico.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 font-bold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-white shadow-xs hover:bg-primary-dark transition"
                >
                  <Plus size={15} />
                  <span>{editingCategory ? 'Save Changes' : 'Add Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
