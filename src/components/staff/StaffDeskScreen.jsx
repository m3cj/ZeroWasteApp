import { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  ArrowRight,
  Home,
  Building2,
  TreePine,
  Phone,
  MapPin,
  X,
  Users,
} from 'lucide-react';

import { registerGenerator } from '../../db/operations';

/**
 * Flow 2 - Page 2: Technician Search & Quick Registration Desk (Role: Zero Waste Technician)
 * - Global search bar: "search in niwasi, contact, user"
 * - Add New Person button (opens modal, replaces old tab switcher)
 * - Cards: Entire card is clickable; 'Select' button removed.
 */
export default function StaffDeskScreen({
  staffEntry,
  setStaffEntry,
  generators = [],
  onProceedToItemEntry,
  onProceedWithExistingUser,
  onRegisterGenerator,
  onBack,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewPersonModalOpen, setIsNewPersonModalOpen] = useState(false);

  // Form state for Add New Person modal
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('family');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // 4 Default Dummy Contacts
  const defaultDummyContacts = useMemo(() => {
    if (generators && generators.length >= 4) {
      return generators.slice(0, 4);
    }
    return [
      {
        id: 'GEN-0001',
        name: 'Ramesh Kumar Sharma',
        category: 'family',
        phone: '9876543210',
        address: 'Flat 302, Shanti Vihar Appts, Kankarbagh, Patna',
      },
      {
        id: 'GEN-0002',
        name: 'Patna Sweet Home & Bakery',
        category: 'business',
        phone: '9876500011',
        address: 'Shop 14, Near Tempo Stand, Kankarbagh, Patna',
      },
      {
        id: 'GEN-0003',
        name: 'Lohia Nagar Community Park & Hall',
        category: 'public',
        phone: '9876500012',
        address: 'Lohia Nagar Park Campus, Sector D, Kankarbagh',
      },
      {
        id: 'GEN-0008',
        name: 'Dr. Amitabh Verma',
        category: 'family',
        phone: '9876500031',
        address: 'Bungalow 4, Road Number 10, Rajendra Nagar, Patna',
      },
    ];
  }, [generators]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return defaultDummyContacts;

    const source = generators && generators.length > 0 ? generators : defaultDummyContacts;
    return source.filter((g) => {
      const name = (g.name || g.ownerName || '').toLowerCase();
      const phone = (g.phone || '').toLowerCase();
      const address = (g.address || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || address.includes(q);
    });
  }, [searchQuery, generators, defaultDummyContacts]);

  const handleCardClick = (user) => {
    const record = {
      ...staffEntry,
      generatorId: user.id,
      name: user.name || user.ownerName,
      category: user.category,
      address: user.address,
      phone: user.phone,
    };
    if (setStaffEntry) setStaffEntry(record);
    if (onProceedWithExistingUser) {
      onProceedWithExistingUser(record);
    }
  };

  const handleSaveNewPerson = (e) => {
    if (e) e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;

    const registerFn = onRegisterGenerator || registerGenerator;
    const registered = registerFn({
      name: newName.trim(),
      category: newCategory,
      address: newAddress.trim(),
      phone: newPhone.trim(),
    });

    const newRecord = {
      ...staffEntry,
      mode: 'case1',
      isStandalone: false,
      generatorId: registered?.id || null,
      name: newName.trim(),
      category: newCategory,
      address: newAddress.trim(),
      phone: newPhone.trim(),
    };

    setStaffEntry(newRecord);
    setIsNewPersonModalOpen(false);
    onProceedToItemEntry(newRecord);
  };

  const categoryOptions = [
    { id: 'family', label: 'Family', icon: Home },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'public', label: 'Public', icon: TreePine },
  ];

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      {/* 1. Global Search & Add New Person Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search in niwasi, contact, user"
            className="w-full rounded-2xl border-2 border-stone-200 bg-white py-2.5 pl-10 pr-9 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-sky-600 focus:outline-none shadow-xs"
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

        {/* Add New Person Action Button */}
        <button
          type="button"
          onClick={() => setIsNewPersonModalOpen(true)}
          className="flex items-center gap-1.5 rounded-2xl bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-700/20 transition hover:bg-sky-800 active:scale-95 shrink-0"
        >
          <UserPlus size={14} />
          <span>Add New Person</span>
        </button>
      </div>

      {/* 3. Contact List (Clean Clickable Cards without Select Button) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-ink-muted">
          <span>{searchQuery ? `Matching Results (${searchResults.length})` : `Saved Contacts (${searchResults.length})`}</span>
          <span className="font-mono text-[10px]">Tap card to select</span>
        </div>

        {searchResults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-6 text-center">
            <p className="text-xs font-bold text-ink">No matching contact found</p>
            <p className="mt-1 text-[11px] text-ink-muted">
              Click &apos;Add New Person&apos; above to register this customer.
            </p>
            <button
              type="button"
              onClick={() => setIsNewPersonModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              <UserPlus size={13} />
              <span>Register New Person</span>
            </button>
          </div>
        ) : (
          searchResults.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleCardClick(user)}
              className="group flex w-full flex-col text-left rounded-2xl border-2 border-stone-200/90 bg-white p-3.5 shadow-xs transition-all duration-150 active:scale-[0.985] hover:border-sky-500 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-xs sm:text-sm font-bold text-ink group-hover:text-sky-800 transition-colors truncate">
                      {user.name || user.ownerName}
                    </h4>
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase border shrink-0 ${
                        user.category === 'business'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : user.category === 'public'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}
                    >
                      {user.category || 'family'}
                    </span>
                  </div>

                  <div className="mt-1.5 space-y-0.5 text-[11px] text-ink-muted">
                    <p className="flex items-center gap-1 font-mono">
                      <Phone size={11} className="text-stone-400 shrink-0" />
                      <span>{user.phone || 'No phone'}</span>
                    </p>
                    <p className="flex items-center gap-1 text-stone-600">
                      <MapPin size={11} className="text-stone-400 shrink-0" />
                      <span className="truncate">{user.address}</span>
                    </p>
                  </div>
                </div>

                {/* Subtle right chevron cue */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400 transition-colors group-hover:bg-sky-100 group-hover:text-sky-800 mt-1">
                  <ArrowRight size={14} />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* 4. Add New Person Modal */}
      {isNewPersonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl space-y-3.5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
                  <UserPlus size={15} />
                </div>
                <h3 className="font-heading text-xs sm:text-sm font-bold text-ink">
                  Add New Person (Registration)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPersonModalOpen(false)}
                className="text-stone-400 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNewPerson} className="space-y-3 text-xs">
              {/* Name * */}
              <div>
                <label className="mb-1 block font-bold text-ink">
                  Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name / business name"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-sky-600 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block font-bold text-ink">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categoryOptions.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = newCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewCategory(cat.id)}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 border-2 transition text-center ${
                          isSelected
                            ? 'border-sky-700 bg-sky-50/80 font-bold text-sky-900 shadow-xs'
                            : 'border-stone-200 bg-stone-50/50 hover:bg-white text-ink-muted'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-sky-700' : 'text-stone-400'} />
                        <span className="mt-1 text-[10px] font-semibold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address * */}
              <div>
                <label className="mb-1 block font-bold text-ink">
                  Address <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="House / flat no., street, landmark"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-ink focus:border-sky-600 focus:outline-none resize-none"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="mb-1 block font-bold text-ink">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-ink focus:border-sky-600 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPersonModalOpen(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 font-semibold text-ink-muted hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || !newAddress.trim()}
                  className="flex-1 rounded-xl bg-sky-700 py-2.5 font-bold text-white shadow-md shadow-sky-700/20 hover:bg-sky-800 disabled:bg-stone-200 disabled:text-stone-400"
                >
                  Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
