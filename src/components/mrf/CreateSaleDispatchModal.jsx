import { useState, useMemo } from 'react';
import {
  X,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const RECYCLER_BUYERS = [
  {
    name: 'Dalmia Paper Mills',
    location: 'Dalmianagar, Bihar',
    gst: '10AABCD1234E1Z8',
    category: 'Paper',
    defaultGrade: 'Cardboard Bales',
    defaultRate: 12800,
  },
  {
    name: 'Ganesha Ecosphere',
    location: 'Kanpur, UP',
    gst: '09AAACG7721F1ZX',
    category: 'Plastic',
    defaultGrade: 'PET Bottle Bales',
    defaultRate: 26500,
  },
  {
    name: 'Patna Steel Works',
    location: 'Fatuha, Patna',
    gst: '10AABCP9982M1Z2',
    category: 'Metal',
    defaultGrade: 'Scrap Iron (HMS-1)',
    defaultRate: 31500,
  },
  {
    name: 'ITC Paperboards',
    location: 'Tribeni, WB',
    gst: '19AAACI1681G1ZM',
    category: 'Paper',
    defaultGrade: 'Newspaper Bales',
    defaultRate: 17500,
  },
  {
    name: 'Balaji Polymers',
    location: 'Hajipur, Bihar',
    gst: '10AABCB5512Q1ZX',
    category: 'Plastic',
    defaultGrade: 'HDPE Plastic Flakes',
    defaultRate: 34000,
  },
  {
    name: 'Jamshedpur Smelters',
    location: 'Jamshedpur, Jharkhand',
    gst: '20AAACJ4410K1ZT',
    category: 'Metal',
    defaultGrade: 'Aluminium Scrap',
    defaultRate: 132000,
  },
  {
    name: 'Asahi Glass',
    location: 'Bawal, Haryana',
    gst: '06AAACA0021N1ZY',
    category: 'Glass',
    defaultGrade: 'Clean Glass Cullet',
    defaultRate: 4200,
  },
];

const PAYMENT_TERMS = [
  'Paid (Bank Transfer)',
  'Paid (UPI)',
  'Pending (15 Days)',
  'Pending (30 Days)',
];

export default function CreateSaleDispatchModal({ isOpen, onClose, onSave, stock = [] }) {
  if (!isOpen) return null;

  const [selectedBuyerIndex, setSelectedBuyerIndex] = useState(0);
  const currentBuyer = RECYCLER_BUYERS[selectedBuyerIndex] || RECYCLER_BUYERS[0];

  const [buyerName, setBuyerName] = useState(currentBuyer.name);
  const [buyerLocation, setBuyerLocation] = useState(currentBuyer.location);
  const [buyerGst, setBuyerGst] = useState(currentBuyer.gst);
  const [materialGrade, setMaterialGrade] = useState(currentBuyer.defaultGrade);
  const [category, setCategory] = useState(currentBuyer.category);
  const [quantityTons, setQuantityTons] = useState('4.5');
  const [ratePerTon, setRatePerTon] = useState(String(currentBuyer.defaultRate));
  const [truckNumber, setTruckNumber] = useState('BR-24-G-8819');
  const [driverName, setDriverName] = useState('Santosh Bind');
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_TERMS[0]);
  const [ewayBill, setEwayBill] = useState(() => `2810${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBuyerSelect = (idx) => {
    setSelectedBuyerIndex(idx);
    const b = RECYCLER_BUYERS[idx];
    if (b) {
      setBuyerName(b.name);
      setBuyerLocation(b.location);
      setBuyerGst(b.gst);
      setMaterialGrade(b.defaultGrade);
      setCategory(b.category);
      setRatePerTon(String(b.defaultRate));
    }
  };

  const qtyNum = Number(quantityTons) || 0;
  const rateNum = Number(ratePerTon) || 0;

  const totalAmount = useMemo(() => {
    if (qtyNum <= 0 || rateNum <= 0) return 0;
    return Math.round(qtyNum * rateNum);
  }, [qtyNum, rateNum]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (qtyNum <= 0 || rateNum <= 0) {
      setErrorMsg('Please enter valid Quantity in Tons and Rate per Ton.');
      return;
    }
    if (!truckNumber || truckNumber.trim().length < 5) {
      setErrorMsg('Please enter a valid Truck number.');
      return;
    }

    const saleId = `SALE-${Date.now()}`;
    const invoiceNumber = `INV-${Math.floor(160 + Math.random() * 800)}`;
    const gatePassNumber = `GP-${Math.floor(160 + Math.random() * 800)}`;

    const newSale = {
      id: saleId,
      invoiceNumber,
      gatePassNumber,
      buyerName: buyerName.trim(),
      buyerLocation: buyerLocation.trim(),
      buyerGst: buyerGst.trim(),
      materialGrade,
      category,
      quantityTons: qtyNum,
      ratePerTon: rateNum,
      totalAmount,
      truckNumber: truckNumber.toUpperCase().trim(),
      driverName: driverName.trim() || 'Driver',
      paymentStatus,
      dispatchDate: new Date().toISOString(),
      status: 'Dispatched',
      ewayBill: ewayBill.trim(),
    };

    onSave(newSale);
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
              <DollarSign size={16} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                New Scrap Sale
              </h3>
              <p className="text-[10px] text-slate-500">
                Commercial Gate Pass & Invoice
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs sm:p-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Buyer Selection */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              1. Buyer / Recycler Mill
            </p>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-600">
                Select Buyer
              </label>
              <select
                value={selectedBuyerIndex}
                onChange={(e) => handleBuyerSelect(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600"
              >
                {RECYCLER_BUYERS.map((buyer, idx) => (
                  <option key={buyer.name} value={idx}>
                    {buyer.name} — {buyer.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] rounded-lg bg-white p-2 border border-stone-200">
              <div>
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Buyer GSTIN</span>
                <span className="font-mono font-bold text-slate-800">{buyerGst}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Location</span>
                <span className="font-medium text-slate-800 truncate block">{buyerLocation}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Material & Price */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              2. Material & Pricing
            </p>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-600">
                Material Grade *
              </label>
              <input
                type="text"
                value={materialGrade}
                onChange={(e) => setMaterialGrade(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Quantity (Tons) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantityTons}
                  onChange={(e) => setQuantityTons(e.target.value)}
                  placeholder="4.5"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
                  required
                />
                <span className="mt-0.5 block font-mono text-[9px] text-slate-400">
                  ≈ {Math.round(qtyNum * 1000).toLocaleString('en-IN')} kg
                </span>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Rate / Ton (₹) *
                </label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  value={ratePerTon}
                  onChange={(e) => setRatePerTon(e.target.value)}
                  placeholder="12800"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
                  required
                />
                <span className="mt-0.5 block font-mono text-[9px] text-slate-400">
                  = ₹{(rateNum / 1000).toFixed(2)}/kg
                </span>
              </div>
            </div>

            {/* Total Billing Box */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase text-emerald-800 block">
                  Total Bill Amount:
                </span>
                <p className="font-mono text-lg font-extrabold text-emerald-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800">
                {qtyNum} Tons
              </span>
            </div>
          </div>

          {/* Section 3: Transport & Payment */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              3. Transport & Payment
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Truck Number *
                </label>
                <input
                  type="text"
                  value={truckNumber}
                  onChange={(e) => setTruckNumber(e.target.value)}
                  placeholder="BR-24-G-8819"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Santosh Bind"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                >
                  {PAYMENT_TERMS.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  E-Way Bill No.
                </label>
                <input
                  type="text"
                  value={ewayBill}
                  onChange={(e) => setEwayBill(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
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
              disabled={qtyNum <= 0 || rateNum <= 0}
              className="flex-[2] min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50 active:scale-98"
            >
              <CheckCircle2 size={15} />
              <span>Confirm & Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
