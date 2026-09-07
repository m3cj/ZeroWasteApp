import { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  FolderTree,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import WasteIcon from '../../shared/WasteIcon';
import { addWasteGroup, updateWasteGroup, deleteWasteGroup } from '../../../db/operations';

const AVAILABLE_ICONS = [
  { id: 'Boxes', label: 'Boxes' },
  { id: 'Cpu', label: 'Electronics' },
  { id: 'AlertTriangle', label: 'Hazardous' },
  { id: 'Apple', label: 'Organic' },
  { id: 'HeartPulse', label: 'Medical' },
  { id: 'Recycle', label: 'Recycle' },
  { id: 'Package', label: 'Package' },
  { id: 'Layers', label: 'Layers' },
];

const AVAILABLE_SWATCHES = [
  { id: 'kraft', label: 'Kraft (Amber)', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'circuit', label: 'Circuit (Sky)', bg: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'resin', label: 'Resin (Rose)', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'flint', label: 'Flint (Emerald)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'gunmetal', label: 'Gunmetal (Slate)', bg: 'bg-slate-100 text-slate-900 border-slate-300' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-100 text-purple-900 border-purple-300' },
];

export default function OperatorGroupsTab({
  wasteGroups = [],
  wasteCategories = [],
  masterItems = [],
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // null when adding, group obj when editing
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: 'Boxes',
    swatch: 'kraft',
  });

  // Calculate child categories and items count per group
  const groupStats = useMemo(() => {
    const map = {};
    for (const group of wasteGroups) {
      const childCategories = wasteCategories.filter((c) => c.groupId === group.id);
      const childCatIds = new Set(childCategories.map((c) => c.id));
      const childItems = masterItems.filter(
        (i) => childCatIds.has(i.categoryId) || i.wasteGroup === group.name || i.groupId === group.id
      );
      map[group.id] = {
        categoriesCount: childCategories.length,
        itemsCount: childItems.length,
      };
    }
    return map;
  }, [wasteGroups, wasteCategories, masterItems]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return wasteGroups;
    return wasteGroups.filter(
      (g) => g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q)
    );
  }, [wasteGroups, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingGroup(null);
    const nextNum = wasteGroups.length + 1;
    const generatedId = `WG-${String(nextNum).padStart(2, '0')}`;
    setFormData({
      id: generatedId,
      name: '',
      icon: 'Boxes',
      swatch: 'kraft',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      id: group.id,
      name: group.name,
      icon: group.icon || 'Boxes',
      swatch: group.swatch || 'kraft',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setErrorMsg('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Group name is required.');
      return;
    }

    if (editingGroup) {
      updateWasteGroup(editingGroup.id, {
        name: formData.name,
        icon: formData.icon,
        swatch: formData.swatch,
      });
      setSuccessMsg(`Group "${formData.name}" updated successfully!`);
    } else {
      // Check duplicate ID
      if (wasteGroups.some((g) => g.id === formData.id.trim())) {
        setErrorMsg(`Group ID "${formData.id}" already exists. Please choose a unique ID.`);
        return;
      }
      addWasteGroup({
        id: formData.id,
        name: formData.name,
        icon: formData.icon,
        swatch: formData.swatch,
      });
      setSuccessMsg(`Group "${formData.name}" created successfully!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleDelete = (group) => {
    const stats = groupStats[group.id] || { categoriesCount: 0, itemsCount: 0 };
    if (stats.categoriesCount > 0 || stats.itemsCount > 0) {
      if (
        !window.confirm(
          `Warning: Group "${group.name}" currently has ${stats.categoriesCount} categories and ${stats.itemsCount} catalog items linked to it. Deleting it may detach these items. Are you sure you want to proceed?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete group "${group.name}" (${group.id})?`)) {
        return;
      }
    }

    deleteWasteGroup(group.id);
    setSuccessMsg(`Group "${group.name}" was deleted.`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const getSwatchBadgeStyle = (swatchName) => {
    const match = AVAILABLE_SWATCHES.find((s) => s.id === swatchName);
    return match ? match.bg : 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary">
              <Boxes size={13} />
              Classification Hierarchy
            </span>
            <span className="text-xs font-mono text-stone-500">
              {wasteGroups.length} Kabaad Groups
            </span>
          </div>
          <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-ink">
            Kabaad Group
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Create, update, and manage top-level scrap material classifications and taxonomies
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition"
        >
          <Plus size={16} />
          <span>Add Kabaad Group</span>
        </button>
      </div>

      {/* Success Notice */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-sans font-bold">Total Groups</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Boxes size={14} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{wasteGroups.length}</p>
          <p className="mt-1 text-[11px] text-stone-400 font-sans">Active scrap hierarchies</p>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-sans font-bold">Linked Categories</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <FolderTree size={14} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{wasteCategories.length}</p>
          <p className="mt-1 text-[11px] text-stone-400 font-sans">Child classifications</p>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-sans font-bold">Catalogue Items</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Package size={14} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{masterItems.length}</p>
          <p className="mt-1 text-[11px] text-stone-400 font-sans">Assigned kabaad items</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search group name or ID..."
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
          Showing {filteredGroups.length} of {wasteGroups.length} groups
        </span>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => {
          const stats = groupStats[group.id] || { categoriesCount: 0, itemsCount: 0 };
          return (
            <div
              key={group.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              {/* Card Top Row */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <WasteIcon name={group.icon || group.name} size={22} />
                    </div>
                    <div>
                      <h2 className="font-heading text-base font-bold text-ink tracking-tight">
                        {group.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/70">
                          {group.id}
                        </span>
                        {group.swatch && (
                          <span
                            className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getSwatchBadgeStyle(
                              group.swatch
                            )}`}
                          >
                            {group.swatch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(group)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-ink transition"
                      title="Edit Group"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(group)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 font-mono text-xs">
                  <div className="rounded-xl bg-stone-50 p-2.5 text-center">
                    <span className="text-[10px] uppercase text-stone-400 font-bold block">
                      Categories
                    </span>
                    <span className="text-sm font-bold text-ink mt-0.5 block">
                      {stats.categoriesCount}
                    </span>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-2.5 text-center">
                    <span className="text-[10px] uppercase text-stone-400 font-bold block">
                      Items
                    </span>
                    <span className="text-sm font-bold text-ink mt-0.5 block">
                      {stats.itemsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <Boxes size={32} className="mx-auto text-stone-400 mb-2" />
            <p className="font-heading text-sm font-bold text-ink">No Kabaad Groups found</p>
            <p className="text-xs text-stone-500 mt-1">Try adjusting your search query or add a new group.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
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
                  {editingGroup ? `Edit Group: ${editingGroup.name}` : 'Add New Kabaad Group'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {editingGroup
                    ? 'Update group label, visual icon, or theme swatch'
                    : 'Create a top-level material classification'}
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

            {/* Live Preview Card */}
            <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Live Card Preview
              </span>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <WasteIcon name={formData.icon || 'Boxes'} size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-ink">
                    {formData.name || 'Group Name'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {formData.id || 'WG-XX'}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getSwatchBadgeStyle(
                        formData.swatch
                      )}`}
                    >
                      {formData.swatch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-ink">Group Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dry Waste, E-Waste, Metal..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-ink">Group ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    disabled={!!editingGroup}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    placeholder="e.g. WG-06"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono text-ink disabled:opacity-60 focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="mb-1.5 block font-bold text-ink">Visual Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((ico) => {
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

              {/* Swatch Selector */}
              <div>
                <label className="mb-1.5 block font-bold text-ink">Swatch Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SWATCHES.map((sw) => {
                    const isSelected = formData.swatch === sw.id;
                    return (
                      <button
                        key={sw.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, swatch: sw.id })}
                        className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 border font-mono text-[11px] font-bold transition ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/30 ' + sw.bg
                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <span>{sw.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
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
                  <span>{editingGroup ? 'Save Changes' : 'Create Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
