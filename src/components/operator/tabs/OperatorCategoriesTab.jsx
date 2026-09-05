import { useState, useMemo } from 'react';
import {
  Building2,
  Home,
  TreePine,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Info,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import {
  addGeneratorCategory,
  deleteGeneratorCategory,
} from '../../../db/operations';

export default function OperatorCategoriesTab({ generatorCategories = [] }) {
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [nameInput, setNameInput] = useState('Family');
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const [customIdInput, setCustomIdInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredCategories = useMemo(() => {
    if (selectedPillar === 'all') return generatorCategories;
    return generatorCategories.filter((c) =>
      (c.name || '').toLowerCase().includes(selectedPillar.toLowerCase())
    );
  }, [generatorCategories, selectedPillar]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!nameInput.trim() || !subCategoryInput.trim()) return;

    const id =
      customIdInput.trim() ||
      `CAT-${nameInput.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    addGeneratorCategory({
      id,
      name: nameInput.trim(),
      subCategory: subCategoryInput.trim(),
    });

    setSuccessMessage(`Category classification "${nameInput} - ${subCategoryInput}" added successfully!`);
    setTimeout(() => setSuccessMessage(''), 3500);

    setSubCategoryInput('');
    setCustomIdInput('');
  };

  const handleDelete = (catId, catName) => {
    if (window.confirm(`Delete category record "${catId}" (${catName})?`)) {
      deleteGeneratorCategory(catId);
    }
  };

  const getCatIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('family')) return Home;
    if (lower.includes('business')) return Building2;
    return TreePine;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-purple-900">
              Relational Taxonomy
            </span>
            <span className="text-xs font-mono text-stone-600">
              {generatorCategories.length} active classification records
            </span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold text-ink">
            Waste Generators Category
          </h1>
          <p className="text-xs text-ink-muted">
            Configure generator classification taxonomy and sub-category tags matching schema
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add New Category Entry Card */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-[#1E7A46]" />
            <h2 className="font-heading text-base font-bold text-ink">
              Add Category Classification Tag
            </h2>
          </div>
          <p className="text-xs text-ink-muted">
            Insert a new category row (id, name, subCategory) into the relational store
          </p>
        </div>

        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="mb-1 block font-bold text-ink">Primary Pillar *</label>
            <select
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-[#1E7A46] focus:bg-white focus:outline-none"
            >
              <option value="Family">Family (Residential)</option>
              <option value="Business">Business (Commercial)</option>
              <option value="Public">Public (Institutions)</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-bold text-ink">Sub-Category Tag *</label>
            <input
              type="text"
              required
              value={subCategoryInput}
              onChange={(e) => setSubCategoryInput(e.target.value)}
              placeholder="e.g. Co-working Hub / Gated Society"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-[#1E7A46] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-ink">Category ID (Optional)</label>
            <input
              type="text"
              value={customIdInput}
              onChange={(e) => setCustomIdInput(e.target.value)}
              placeholder="e.g. family-society"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono text-ink focus:border-[#1E7A46] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E7A46] py-2.5 font-bold text-white hover:bg-[#166037] active:scale-95 transition shadow-xs"
            >
              <Plus size={15} />
              <span>Add Record</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter & Taxonomy Table */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-heading text-base font-bold text-ink">
              Taxonomy Classification Records
            </h2>
            <p className="text-xs text-ink-muted">
              {filteredCategories.length} categories configured in database
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 font-mono text-xs">
            {['all', 'family', 'business', 'public'].map((pillar) => (
              <button
                key={pillar}
                type="button"
                onClick={() => setSelectedPillar(pillar)}
                className={`rounded-lg px-2.5 py-1 font-bold uppercase text-[10px] transition ${
                  selectedPillar === pillar
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {pillar}
              </button>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((cat) => {
            const Icon = getCatIcon(cat.name);
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/70 p-4 hover:bg-white hover:shadow-xs transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-heading text-xs font-bold text-ink truncate">{cat.name}</p>
                      <span className="font-mono text-[9px] bg-stone-200/80 px-1.5 py-0.2 rounded font-bold text-stone-700">
                        {cat.id}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted truncate mt-0.5">
                      {cat.subCategory || 'General Classification'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="rounded-lg p-1.5 text-stone-400 opacity-80 hover:bg-rose-50 hover:text-rose-600 transition shrink-0"
                  title="Remove category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
