import { useState, useMemo } from 'react';
import {
  X,
  Scale,
  Truck,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const VEHICLE_TYPES = [
  'Tata Ace',
  'E-Rickshaw',
  'Bolero Pickup',
  'Tata 407',
  'Tricycle',
  'Other',
];

const SOURCE_ROUTES = [
  'Kankarbagh Ward 45',
  'Boring Road',
  'Patliputra Industrial Area',
  'Kadamkuan',
  'Anisabad Hub',
  'Patna University',
  'Walk-in / Direct',
];

const CATEGORIES = [
  'Paper',
  'Plastic',
  'Metal',
  'E-Waste',
  'Glass',
];

export default function InwardConsignmentModal({ isOpen, onClose, onSave, masterItems = [] }) {
  if (!isOpen) return null;

  const [vehicleNumber, setVehicleNumber] = useState('BR-01-');
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [driverName, setDriverName] = useState('Ajay Paswan');
  const [sourceLocation, setSourceLocation] = useState(SOURCE_ROUTES[0]);
  const [primaryCategory, setPrimaryCategory] = useState(CATEGORIES[0]);
  const [grossWeight, setGrossWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');
  const [moistureDeduction, setMoistureDeduction] = useState('0');
  const [payoutIssued, setPayoutIssued] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Weight calculations
  const grossNum = Number(grossWeight) || 0;
  const tareNum = Number(tareWeight) || 0;
  const moistNum = Number(moistureDeduction) || 0;

  const netScrapKg = useMemo(() => {
    if (grossNum <= 0 || tareNum <= 0) return 0;
    return Math.max(0, grossNum - tareNum);
  }, [grossNum, tareNum]);

  const acceptedNetKg = useMemo(() => {
    return Math.max(0, netScrapKg - moistNum);
  }, [netScrapKg, moistNum]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!vehicleNumber || vehicleNumber.trim().length < 5) {
      setErrorMsg('Please enter a valid vehicle number.');
      return;
    }
    if (grossNum <= 0 || tareNum <= 0) {
      setErrorMsg('Please enter valid Gross and Tare weights.');
      return;
    }
    if (grossNum <= tareNum) {
      setErrorMsg('Gross weight must be greater than tare weight.');
      return;
    }

    const slipNumber = `Slip #${Math.floor(800 + Math.random() * 200)}`;
    const newId = `INW-${Date.now()}`;

    const newConsignment = {
      id: newId,
      slipNumber,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType,
      driverName: driverName.trim(),
      technician: 'Sunil Kumar',
      sourceType: 'Route Collection',
      sourceLocation,
      primaryCategory,
      grossWeightKg: grossNum,
      tareWeightKg: tareNum,
      netScrapKg,
      moistureDeductionKg: moistNum,
      acceptedNetKg,
      payoutIssued: Number(payoutIssued) || 0,
      timestamp: new Date().toISOString(),
      status: 'Offloaded',
      remarks: remarks.trim() || 'Direct Inward Load',
    };

    onSave(newConsignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs transition-opacity sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Bottom Sheet Container */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-stone-200 bg-white shadow-2xl animate-slide-up sm:rounded-2xl overflow-hidden">
        {/* Grab Handle */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Scale size={16} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Log Inward Load
              </h3>
              <p className="text-[10px] text-slate-500">
                Weighbridge Entry Slip
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-stone-200 hover:text-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs sm:p-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Vehicle & Driver */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              1. Vehicle & Route
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Vehicle No. *
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="BR-01-GB-4412"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Ajay Paswan"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Category *
                </label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-600">
                Route / Pickup Location
              </label>
              <select
                value={sourceLocation}
                onChange={(e) => setSourceLocation(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              >
                {SOURCE_ROUTES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Weight Scale */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              2. Weighbridge Readings (kg)
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Gross Weight *
                </label>
                <input
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="3240"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Tare (Empty) Weight *
                </label>
                <input
                  type="number"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(e.target.value)}
                  placeholder="1820"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Deduction (kg)
                </label>
                <input
                  type="number"
                  value={moistureDeduction}
                  onChange={(e) => setMoistureDeduction(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Cash Paid (₹)
                </label>
                <input
                  type="number"
                  value={payoutIssued}
                  onChange={(e) => setPayoutIssued(e.target.value)}
                  placeholder="11800"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Net Result Box */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Net Accepted Weight:
                </span>
                <span className="font-mono text-lg font-extrabold text-emerald-900">
                  {acceptedNetKg.toLocaleString('en-IN')} kg
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800">
                ({(acceptedNetKg / 1000).toFixed(2)} Tons)
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="border-t border-stone-200 pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[40px] rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={grossNum <= 0 || tareNum <= 0}
              className="flex-[2] min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50 active:scale-98"
            >
              <CheckCircle2 size={15} />
              <span>Save & Generate Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
