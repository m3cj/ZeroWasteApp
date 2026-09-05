import {
  X,
  Printer,
  CheckCircle2,
  Scale,
  QrCode,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function GatePassModal({ isOpen, onClose, data, type = 'sale' }) {
  if (!isOpen || !data) return null;

  const isSale = type === 'sale';
  const title = isSale ? 'Commercial Gate Pass' : 'Weighbridge Entry Slip';
  const docId = isSale ? data.gatePassNumber || data.id : data.slipNumber || data.id;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs transition-opacity sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Bottom Sheet */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-stone-200 bg-white shadow-2xl animate-slide-up sm:rounded-2xl overflow-hidden">
        {/* Grab Handle */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isSale ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
              {isSale ? <FileText size={16} /> : <Scale size={16} />}
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                {title}
              </h3>
              <p className="font-mono text-[10px] text-slate-500">
                {docId}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs sm:p-5">
          {/* Facility Card */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
            <p className="font-heading text-sm font-bold uppercase text-slate-900">
              Patna Central MRF
            </p>
            <p className="text-[10px] text-slate-500">
              Zero Waste Operations • Patna, Bihar
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
              <CheckCircle2 size={11} />
              <span>Verified Scale Record</span>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Record ID</span>
                <span className="font-mono font-bold text-slate-900">{docId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Date & Time</span>
                <span className="font-mono text-slate-700">{formatDateTime(data.timestamp || data.dispatchDate || new Date().toISOString())}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Vehicle</span>
                <span className="font-mono font-bold text-slate-900 bg-stone-100 px-1.5 py-0.5 rounded inline-block">
                  {data.vehicleNumber || data.truckNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Driver / Staff</span>
                <span className="font-semibold text-slate-800">{data.driverName || data.technician || 'Staff'}</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-2">
              {isSale ? (
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Buyer</span>
                  <p className="font-bold text-slate-900">{data.buyerName}</p>
                  <p className="text-[11px] text-slate-500">{data.buyerLocation}</p>
                  {data.buyerGst && <p className="font-mono text-[10px] text-slate-500">GST: {data.buyerGst}</p>}
                </div>
              ) : (
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Source Route</span>
                  <p className="font-bold text-slate-900">{data.sourceLocation || 'Direct Inward'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Weight & Value Breakdown */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-stone-200 font-bold text-slate-900">
              <span>{isSale ? 'Sale Details' : 'Weight Breakdown'}</span>
              <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                {isSale ? data.category : data.primaryCategory}
              </span>
            </div>

            {isSale ? (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Grade:</span>
                  <span className="font-semibold text-slate-900">{data.materialGrade}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Weight:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {data.quantityTons} Tons ({Math.round(Number(data.quantityTons || 0) * 1000)} kg)
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Rate / Ton:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(data.ratePerTon)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-stone-200 pt-1 text-sm">
                  <span className="font-bold text-slate-900">Total Amount:</span>
                  <span className="font-mono font-extrabold text-emerald-800">
                    {formatCurrency(data.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                  <span>Payment:</span>
                  <span className="font-semibold text-slate-800">{data.paymentStatus || 'Paid'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Gross:</span>
                  <span className="font-mono font-semibold text-slate-900">{data.grossWeightKg} kg</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tare:</span>
                  <span className="font-mono font-semibold text-slate-900">(-) {data.tareWeightKg} kg</span>
                </div>
                {Number(data.moistureDeductionKg || 0) > 0 && (
                  <div className="flex justify-between items-center text-amber-700">
                    <span>Deduction:</span>
                    <span className="font-mono font-semibold">(-) {data.moistureDeductionKg} kg</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-stone-200 pt-1 text-sm">
                  <span className="font-bold text-slate-900">Net Weight:</span>
                  <span className="font-mono font-extrabold text-emerald-800">
                    {data.acceptedNetKg || data.netScrapKg} kg ({(Number(data.acceptedNetKg || data.netScrapKg) / 1000).toFixed(2)} MT)
                  </span>
                </div>
                {data.payoutIssued > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                    <span>Cash Paid:</span>
                    <span className="font-mono font-semibold text-slate-900">{formatCurrency(data.payoutIssued)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Bar */}
          <div className="rounded-xl border border-stone-200 p-2.5 bg-[#FAF8F5] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-700 block">Verified by Scale</span>
              <p className="text-[10px] text-slate-500">Supervisor: Sunil Kumar</p>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-lg border border-stone-200">
              <QrCode size={28} className="text-slate-800" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-stone-200 bg-white p-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[40px] rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-stone-200 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-[2] min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition active:scale-98"
          >
            <Printer size={14} />
            <span>Print Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
