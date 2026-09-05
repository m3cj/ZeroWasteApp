import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, MapPin, Phone, Building, AlertCircle } from 'lucide-react';
import CategoryTag from '../shared/CategoryTag';
import { CATEGORY_META } from '../../constants';
import { formatCurrency, formatPhone } from '../../utils/formatters';

export default function GeneratorsTab({
  generators = [],
  setGenerators,
  communities = [],
  routeSchedule = [],
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGen, setNewGen] = useState({
    ownerName: '',
    category: 'family',
    phone: '',
    addressLine: '',
    area: '',
    pincode: '800020',
    city: 'Patna',
    communityId: communities[0]?.id || 'COM-001',
    outstandingDues: '0',
  });
  const [editingId, setEditingId] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newGen.ownerName.trim()) return;

    const matchedComm = communities.find((c) => c.id === newGen.communityId) || communities[0];
    const fullAddress = `${newGen.addressLine.trim()}${newGen.area ? `, ${newGen.area.trim()}` : ''}, ${newGen.city} - ${newGen.pincode}`;

    const nextId = `GEN-${String(generators.length + 1).padStart(4, '0')}`;
    setGenerators((prev) => [
      {
        id: nextId,
        communityId: newGen.communityId,
        communityName: matchedComm?.name || 'Kankarbagh',
        name: newGen.ownerName.trim(),
        ownerName: newGen.ownerName.trim(),
        category: newGen.category,
        phone: newGen.phone.trim() || '9876500000',
        addressLine: newGen.addressLine.trim(),
        area: newGen.area.trim(),
        pincode: newGen.pincode.trim(),
        city: newGen.city.trim(),
        address: fullAddress,
        kabadiAttached: false,
        kabadiNotes: '',
        preferredSlots: ['Morning (8:00 AM - 11:00 AM)'],
        specialOrderRemarks: '',
        lastTransactionDate: null,
        outstandingDues: Number(newGen.outstandingDues) || 0,
      },
      ...prev,
    ]);

    setNewGen({
      ownerName: '',
      category: 'family',
      phone: '',
      addressLine: '',
      area: '',
      pincode: '800020',
      city: 'Patna',
      communityId: communities[0]?.id || 'COM-001',
      outstandingDues: '0',
    });
    setIsAdding(false);
  };

  const handleUpdate = (id, field, value) => {
    setGenerators((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleRemove = (id) => {
    setGenerators((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-bold text-ink">Generator Database</h3>
          <p className="text-[11px] text-ink-muted">Registered Patna waste generators</p>
        </div>
        <button
          onClick={() => setIsAdding((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-xl bg-route px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-route-dark active:scale-95"
        >
          <Plus size={13} />
          <span>{isAdding ? 'Cancel' : 'Add Generator'}</span>
        </button>
      </div>

      {/* Add Generator Card Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border-2 border-route/30 bg-route-soft/40 p-4 shadow-sm space-y-3 animate-slide-up"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-route">
            New Generator Record
          </p>

          <div className="space-y-2.5">
            <div>
              <label className="mobile-label">Name / Contact</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={newGen.ownerName}
                onChange={(e) => setNewGen((prev) => ({ ...prev, ownerName: e.target.value }))}
                className="mobile-input text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mobile-label">Category</label>
                <select
                  value={newGen.category}
                  onChange={(e) => setNewGen((prev) => ({ ...prev, category: e.target.value }))}
                  className="mobile-input text-xs font-medium"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mobile-label">Community</label>
                <select
                  value={newGen.communityId}
                  onChange={(e) => setNewGen((prev) => ({ ...prev, communityId: e.target.value }))}
                  className="mobile-input text-xs font-medium"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mobile-label">Phone</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={newGen.phone}
                  onChange={(e) => setNewGen((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mobile-input text-xs"
                />
              </div>

              <div>
                <label className="mobile-label">Pending Dues (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newGen.outstandingDues}
                  onChange={(e) => setNewGen((prev) => ({ ...prev, outstandingDues: e.target.value }))}
                  className="mobile-input font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mobile-label">Address Line</label>
              <input
                type="text"
                placeholder="Door, Street, Apartment"
                value={newGen.addressLine}
                onChange={(e) => setNewGen((prev) => ({ ...prev, addressLine: e.target.value }))}
                className="mobile-input text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary py-2.5 text-xs">
              Save Generator
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-secondary py-2.5 text-xs w-auto px-4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Generators List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
        {generators.map((g) => {
          const isEditing = editingId === g.id;
          const dues = Number(g.outstandingDues || 0);

          return (
            <div
              key={g.id}
              className="rounded-xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-stone-400">{g.id}</span>
                    <CategoryTag category={g.category} showIcon={true} size="xs" />
                    {g.communityName && (
                      <span className="text-[10px] text-route font-semibold bg-route-soft px-1.5 py-0.2 rounded font-mono">
                        {g.communityName}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={g.name || g.ownerName}
                      onChange={(e) => {
                        handleUpdate(g.id, 'name', e.target.value);
                        handleUpdate(g.id, 'ownerName', e.target.value);
                      }}
                      className="mobile-input py-1 text-xs font-bold mt-1"
                    />
                  ) : (
                    <h4 className="font-heading text-sm font-bold text-ink mt-0.5 truncate">
                      {g.name || g.ownerName}
                    </h4>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingId(isEditing ? null : g.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                    title={isEditing ? 'Done' : 'Edit'}
                  >
                    {isEditing ? <Check size={12} className="text-ledger" /> : <Edit2 size={12} />}
                  </button>

                  <button
                    onClick={() => handleRemove(g.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stamp/20 bg-stamp-soft text-stamp hover:bg-stamp hover:text-white"
                    title="Delete generator"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Address & Phone */}
              <div className="space-y-1 text-xs text-ink-muted bg-stone-50 rounded-lg p-2">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={12} className="shrink-0 text-stone-400" />
                  <span className="truncate">{g.address}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="shrink-0 text-stone-400" />
                    <span className="font-mono">{formatPhone(g.phone)}</span>
                  </div>
                  {(g.kabadiAttached || g.kabaadAttached) && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.2 font-semibold text-[9px] text-amber-800">
                      Kabaad Linked
                    </span>
                  )}
                </div>
              </div>

              {/* Dues Row */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                <span className="text-ink-muted">Outstanding Dues</span>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">₹</span>
                    <input
                      type="number"
                      value={g.outstandingDues}
                      onChange={(e) => handleUpdate(g.id, 'outstandingDues', Number(e.target.value) || 0)}
                      className="w-16 rounded border border-stone-300 px-1 py-0.5 font-mono text-xs text-right font-bold text-ink"
                    />
                  </div>
                ) : (
                  <span
                    className={`font-mono text-xs font-bold ${
                      dues > 0 ? 'text-stamp' : 'text-ledger'
                    }`}
                  >
                    {formatCurrency(dues)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
