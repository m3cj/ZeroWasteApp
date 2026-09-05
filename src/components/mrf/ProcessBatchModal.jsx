import { useState, useMemo } from 'react';
import {
  X,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const PROCESSING_LINES = [
  'Baler #1',
  'Baler #2',
  'Sorting Line #2',
  'Magnetic Separator',
  'Glass Crusher',
  'Manual Sorting Line',
];

const PRODUCTS_MAP = {
  Paper: [
    'Cardboard Bales',
    'Newspaper (Raddi) Bales',
    'White Paper Bales',
  ],
  Plastic: [
    'PET Bottle Bales',
    'HDPE Plastic Flakes',
    'Plastic Film Bales',
  ],
  Metal: [
    'Sorted Iron Scrap',
    'Aluminium Bales',
    'Copper Bundles',
  ],
  'E-Waste': [
    'Sorted Circuit Boards',
    'Motor Parts',
  ],
  Glass: [
    'Clean Glass Cullet',
    'Mixed Glass',
  ],
};

export default function ProcessBatchModal({ isOpen, onClose, onSave, stock = [] }) {
  if (!isOpen) return null;

  const [lineName, setLineName] = useState(PROCESSING_LINES[0]);
  const [inputCategory, setInputCategory] = useState('Paper');
  const [inputRawKg, setInputRawKg] = useState('1000');
  const [outputProduct, setOutputProduct] = useState(PRODUCTS_MAP['Paper'][0]);
  const [outputProcessedKg, setOutputProcessedKg] = useState('940');
  const [baleCount, setBaleCount] = useState('3');
  const [residueKg, setResidueKg] = useState('60');
  const [operator, setOperator] = useState('Sunil Kumar');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCategoryChange = (cat) => {
    setInputCategory(cat);
    const available = PRODUCTS_MAP[cat] || ['Sorted Scrap'];
    setOutputProduct(available[0]);
  };

  const inputNum = Number(inputRawKg) || 0;
  const outputNum = Number(outputProcessedKg) || 0;
  const resNum = Number(residueKg) || 0;
  const balesNum = Number(baleCount) || 0;

  const avgBaleWeight = useMemo(() => {
    if (balesNum <= 0 || outputNum <= 0) return 0;
    return Math.round(outputNum / balesNum);
  }, [outputNum, balesNum]);

  const recoveryEfficiency = useMemo(() => {
    if (inputNum <= 0) return 0;
    return Math.round(((outputNum / inputNum) * 100) * 10) / 10;
  }, [inputNum, outputNum]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputNum <= 0 || outputNum <= 0) {
      setErrorMsg('Please enter valid Input and Output weights.');
      return;
    }
    if (outputNum > inputNum) {
      setErrorMsg('Output weight cannot exceed input scrap weight.');
      return;
    }

    const newId = `PRC-${Date.now()}`;
    const newBatch = {
      id: newId,
      lineName,
      inputCategory,
      inputRawKg: inputNum,
      outputProcessedKg: outputNum,
      outputProduct,
      baleCount: balesNum,
      avgBaleWeightKg: avgBaleWeight,
      residueKg: resNum,
      residueType: 'Residue to RDF',
      recoveryEfficiencyPct: recoveryEfficiency,
      operator: operator.trim() || 'Operator',
      timestamp: new Date().toISOString(),
    };

    onSave(newBatch);
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Add Sorting Batch
              </h3>
              <p className="text-[10px] text-slate-500">
                Processing & Recovery Entry
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

          {/* Section 1: Line & Stream */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              1. Sorting Line & Category
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Processing Machine
                </label>
                <select
                  value={lineName}
                  onChange={(e) => setLineName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                >
                  {PROCESSING_LINES.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Input Stream
                </label>
                <select
                  value={inputCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                >
                  {Object.keys(PRODUCTS_MAP).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-600">
                Sorted Output Product
              </label>
              <select
                value={outputProduct}
                onChange={(e) => setOutputProduct(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600"
              >
                {(PRODUCTS_MAP[inputCategory] || []).map((prod) => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Yield & Weights */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              2. Weight Input & Output (kg)
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Raw Input (kg) *
                </label>
                <input
                  type="number"
                  value={inputRawKg}
                  onChange={(e) => setInputRawKg(e.target.value)}
                  placeholder="1000"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Sorted Output (kg) *
                </label>
                <input
                  type="number"
                  value={outputProcessedKg}
                  onChange={(e) => setOutputProcessedKg(e.target.value)}
                  placeholder="940"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-sm font-bold text-emerald-900 outline-none focus:border-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Bale Count
                </label>
                <input
                  type="number"
                  value={baleCount}
                  onChange={(e) => setBaleCount(e.target.value)}
                  placeholder="3"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Residue to RDF (kg)
                </label>
                <input
                  type="number"
                  value={residueKg}
                  onChange={(e) => setResidueKg(e.target.value)}
                  placeholder="60"
                  className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Yield Result Box */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Recovery Yield:
                </span>
                <span className="font-mono text-lg font-extrabold text-emerald-900">
                  {recoveryEfficiency}%
                </span>
              </div>
              {balesNum > 0 && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Avg Bale Wt:
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-900">
                    {avgBaleWeight} kg/bale
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Operator */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
            <label className="mb-1 block text-[10px] font-bold text-slate-600">
              Shift Operator Name
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="Sunil Kumar"
              className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
            />
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
              disabled={inputNum <= 0 || outputNum <= 0}
              className="flex-[2] min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50 active:scale-98"
            >
              <CheckCircle2 size={15} />
              <span>Save Batch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
