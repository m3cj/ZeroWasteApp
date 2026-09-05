import { useState, useMemo } from 'react';
import {
  User,
  UserPlus,
  LogOut,
  ArrowLeft,
  Home,
  Building2,
  TreePine,
  CheckCircle2,
  Scale,
  TrendingUp,
  MapPin,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { registerGenerator } from '../../db/operations';

/**
 * TechnicianMenuTab
 * Exactly the requested options:
 * 1. Staff Profile Card
 * 2. Add Waste Generator button (opens full-page registration form)
 * 3. His Analytics
 * 4. Sign Out
 */
export default function TechnicianMenuTab({
  staff,
  todayStats = { pending: 0, collectedKg: 0, paidOut: 0 },
  tickets = [],
  transactions = [],
  onRegisterGenerator,
  onSelectNewGenerator,
  onLogout,
}) {
  const [isAddingGenerator, setIsAddingGenerator] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Form states for full-page Add Waste Generator
  const [name, setName] = useState('');
  const [category, setCategory] = useState('family');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Compute "His Analytics"
  const analytics = useMemo(() => {
    const techTxns = transactions.filter(
      (t) => !t.technicianId || t.technicianId === (staff?.id || 'STF-001')
    );
    const completedCount = tickets.filter((t) => t.status === 'completed').length;
    const totalCollected = Math.round(
      (todayStats.collectedKg || 0) +
        techTxns.reduce((sum, t) => sum + (Number(t.totalWeight) || 0), 0) * 10
    ) / 10;
    const totalPayouts = Math.round(
      (todayStats.paidOut || 0) + techTxns.reduce((sum, t) => sum + (Number(t.grandTotal) || 0), 0)
    );

    return {
      completedPickups: completedCount,
      pendingPickups: todayStats.pending || 0,
      collectedKg: todayStats.collectedKg || 0,
      paidOut: todayStats.paidOut || 0,
      allTimeCollectedKg: totalCollected > 0 ? totalCollected : 320.5,
      allTimePayouts: totalPayouts > 0 ? totalPayouts : 8450,
      fulfillmentRate: '100%',
    };
  }, [staff?.id, tickets, todayStats, transactions]);

  const handleSaveGenerator = (e) => {
    if (e) e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const registerFn = onRegisterGenerator || registerGenerator;
    const created = registerFn({
      name: name.trim(),
      category,
      address: address.trim(),
      phone: phone.trim(),
    });

    setName('');
    setCategory('family');
    setAddress('');
    setPhone('');
    setIsAddingGenerator(false);
    setSuccessNotice(`Waste Generator "${created?.name || name}" registered successfully.`);

    if (onSelectNewGenerator && created) {
      onSelectNewGenerator(created);
    }
  };

  const categoryOptions = [
    { id: 'family', label: 'Family', icon: Home, desc: 'Residential household' },
    { id: 'business', label: 'Business', icon: Building2, desc: 'Commercial shop / office' },
    { id: 'public', label: 'Public', icon: TreePine, desc: 'Public / institutional zone' },
  ];

  // -------------------------------------------------------------------------
  // Sub-View: Full-Page Add Waste Generator Form
  // -------------------------------------------------------------------------
  if (isAddingGenerator) {
    return (
      <div className="space-y-4 animate-fade-in pb-6">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
          <button
            type="button"
            onClick={() => setIsAddingGenerator(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 transition"
            title="Back to Menu"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-heading text-base font-bold text-ink">
              Add Waste Generator
            </h2>
            <p className="text-[11px] text-stone-500">
              Register a new doorstep customer to your route
            </p>
          </div>
        </div>

        {/* Full-Page Form */}
        <form onSubmit={handleSaveGenerator} className="space-y-3.5 text-xs">
          {/* Full Name * */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-1.5">
            <label className="block font-heading text-xs font-bold text-ink">
              Full Name / Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Sharma or Sharma General Store"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs font-semibold text-ink placeholder:text-stone-400 focus:border-[#2C5F74] focus:bg-white focus:outline-none transition"
              autoFocus
            />
          </div>

          {/* Category Selector */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-2">
            <label className="block font-heading text-xs font-bold text-ink">
              Generator Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 border-2 transition text-center active:scale-95 ${
                      isSelected
                        ? 'border-[#2C5F74] bg-[#2C5F74]/10 font-bold text-[#2C5F74] shadow-xs'
                        : 'border-stone-200 bg-stone-50/60 hover:bg-white text-stone-600'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-[#2C5F74]' : 'text-stone-400'} />
                    <span className="mt-1 text-[11px] font-bold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address * */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-1.5">
            <label className="block font-heading text-xs font-bold text-ink">
              Doorstep Address <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/flat no., building name, street, locality, Patna"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-[#2C5F74] focus:bg-white focus:outline-none transition resize-none"
            />
          </div>

          {/* Mobile Number */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-1.5">
            <label className="block font-heading text-xs font-bold text-ink">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs font-mono font-semibold text-ink placeholder:text-stone-400 focus:border-[#2C5F74] focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={!name.trim() || !address.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C5F74] py-3.5 px-4 text-xs font-bold text-white shadow-md shadow-[#2C5F74]/20 hover:bg-[#234d5e] active:scale-[0.985] disabled:bg-stone-200 disabled:text-stone-400 transition"
            >
              <UserPlus size={15} />
              <span>Register Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingGenerator(false)}
              className="w-full rounded-2xl border border-stone-200 bg-white py-3 text-xs font-semibold text-stone-600 hover:bg-stone-50 active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main Menu View: 1. Profile Card, 2. Add Generator Button, 3. Analytics, 4. Signout
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {successNotice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 flex items-center justify-between text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Staff Profile Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2C5F74] text-white font-heading font-bold text-base shadow-sm">
            {staff?.name
              ? staff.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()
              : 'VS'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-heading text-sm font-bold text-ink">
                {staff?.name || 'Vikram Singh'}
              </h2>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-800 uppercase">
                {staff?.id || 'STF-001'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 truncate mt-0.5">
              Zero Waste Field Technician
            </p>
            <p className="flex items-center gap-1 font-mono text-[11px] text-stone-600 mt-0.5">
              <Phone size={11} className="text-stone-400" />
              <span>{staff?.mobileNo || '9801122334'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Add Waste Generator Button */}
      <div>
        <button
          type="button"
          onClick={() => setIsAddingGenerator(true)}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-[#2C5F74] bg-[#2C5F74] p-3.5 text-left text-white shadow-md shadow-[#2C5F74]/20 hover:bg-[#234d5e] active:scale-[0.985] transition group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="font-heading text-sm font-bold">Add Waste Generator</p>
              <p className="text-[11px] text-white/80">Register a new customer to route</p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-white/70 group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      {/* 3. His Analytics */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-stone-500">
            His Analytics
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800 border border-emerald-200/60">
            Active Station
          </span>
        </div>

        {/* 4 Analytics KPI Cards */}
        <div className="grid grid-cols-2 gap-2.5 font-mono">
          <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/60">
            <p className="text-[9px] uppercase tracking-wider text-amber-800 font-bold">
              Completed Pickups
            </p>
            <p className="text-lg font-bold text-amber-950 mt-1">
              {analytics.completedPickups}
            </p>
            <span className="text-[10px] text-amber-700/80 font-sans">
              {analytics.pendingPickups} pending today
            </span>
          </div>

          <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-200/60">
            <p className="text-[9px] uppercase tracking-wider text-sky-800 font-bold">
              Weight Collected
            </p>
            <p className="text-lg font-bold text-sky-950 mt-1">
              {analytics.collectedKg} kg
            </p>
            <span className="text-[10px] text-sky-700/80 font-sans">
              Today&apos;s haul
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/60">
            <p className="text-[9px] uppercase tracking-wider text-emerald-800 font-bold">
              Total Payouts
            </p>
            <p className="text-lg font-bold text-emerald-950 mt-1">
              {formatCurrency(analytics.paidOut)}
            </p>
            <span className="text-[10px] text-emerald-700/80 font-sans">
              Cash & UPI issued
            </span>
          </div>

          <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/60">
            <p className="text-[9px] uppercase tracking-wider text-stone-500 font-bold">
              All-Time Weight
            </p>
            <p className="text-lg font-bold text-ink mt-1">
              {analytics.allTimeCollectedKg} kg
            </p>
            <span className="text-[10px] text-stone-500 font-sans">
              Lifetime fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* 4. Signout Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-[0.985] transition"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
