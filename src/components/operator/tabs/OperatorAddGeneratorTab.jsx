import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  CalendarDays,
  ShoppingBag,
} from 'lucide-react';
import { registerGenerator } from '../../../db/operations';
import CategoryTag from '../../shared/CategoryTag';
import { formatCurrency } from '../../../utils/formatters';

export default function OperatorAddGeneratorTab({
  generators = [],
  generatorCategories = [],
  onBookPickupTicket,
  onDirectPurchase,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    category: 'family',
    phone: '',
    address: '',
  });

  const filteredGenerators = useMemo(() => {
    return generators.filter((g) => {
      if (selectedCatFilter !== 'all' && g.category !== selectedCatFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (g.name || g.ownerName || '').toLowerCase().includes(q) ||
          (g.phone || '').includes(q) ||
          (g.address || '').toLowerCase().includes(q) ||
          (g.id || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [generators, selectedCatFilter, searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    const created = registerGenerator({
      name: form.name.trim(),
      category: form.category,
      phone: form.phone.trim(),
      address: form.address.trim() || 'Patna, Bihar',
    });

    setSuccessMessage(`Waste Generator ${created.name} (${created.id}) registered successfully.`);
    setTimeout(() => setSuccessMessage(''), 4000);

    setForm({
      name: '',
      category: 'family',
      phone: '',
      address: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <h1 className="font-heading text-xl font-bold text-ink tracking-tight">
            Waste Generators
          </h1>
          <p className="font-mono text-xs text-stone-500 mt-0.5">
            {generators.length} registered waste generators in hub directory
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Register Generator</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Niwasi name, phone, address, or generator ID..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2 pl-10 pr-8 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition"
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

        {/* Category Segmented Control strictly using base terms: Family, Business, Public */}
        <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 font-mono text-xs shrink-0 border border-stone-200/60">
          {[
            { id: 'all', label: 'All' },
            { id: 'family', label: 'Family' },
            { id: 'business', label: 'Business' },
            { id: 'public', label: 'Public' },
          ].map((tab) => {
            const active = selectedCatFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCatFilter(tab.id)}
                className={`rounded-lg px-3.5 py-1 font-bold transition ${
                  active
                    ? 'bg-white text-ink shadow-2xs'
                    : 'text-stone-600 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Generator Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] font-bold text-stone-600">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Waste Generator</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3 text-right">Lifetime KG</th>
                <th className="px-5 py-3 text-right">Payouts</th>
                <th className="px-5 py-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGenerators.length > 0 ? (
                filteredGenerators.map((gen) => (
                  <tr key={gen.id} className="hover:bg-stone-50/60 transition">
                    <td className="px-5 py-3 font-mono font-bold text-stone-500">
                      {gen.id}
                    </td>

                    <td className="px-5 py-3 font-heading font-bold text-ink">
                      {gen.name || gen.ownerName}
                    </td>

                    <td className="px-5 py-3">
                      <CategoryTag category={gen.category} size="xs" />
                    </td>

                    <td className="px-5 py-3 font-mono text-stone-600">
                      {gen.phone || '—'}
                    </td>

                    <td className="px-5 py-3 text-stone-600 truncate max-w-xs">
                      {gen.address || '—'}
                    </td>

                    <td className="px-5 py-3 font-mono font-bold text-stone-700 text-right">
                      {gen.lifetimeKG ?? gen.lifetimeKg ?? 0} kg
                    </td>

                    <td className="px-5 py-3 font-mono font-bold text-emerald-800 text-right">
                      {formatCurrency(gen.totalPayout ?? gen.totalPayouts ?? 0)}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onBookPickupTicket && (
                          <button
                            type="button"
                            onClick={() => onBookPickupTicket(gen.id)}
                            className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-stone-100 transition"
                            title="Schedule Pickup Ticket"
                          >
                            <CalendarDays size={12} className="text-sky-700" />
                            <span>Ticket</span>
                          </button>
                        )}
                        {onDirectPurchase && (
                          <button
                            type="button"
                            onClick={() => onDirectPurchase(gen.id)}
                            className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition"
                            title="Purchase Kabaad"
                          >
                            <ShoppingBag size={12} />
                            <span>Purchase</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-stone-500">
                    No waste generators found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Generator Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-heading text-base font-bold text-ink">
                Register Waste Generator
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-ink">Waste Generator Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar Sharma or Anand Vihar RWA"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                >
                  <option value="family">Family</option>
                  <option value="business">Business</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono font-bold text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Flat 204, Shanti Apartments, Patna"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 font-bold text-white hover:bg-primary-dark transition shadow-xs"
                >
                  Register Generator
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
