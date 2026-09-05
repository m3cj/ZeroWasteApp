import { ArrowRight, PhoneCall } from 'lucide-react';

/**
 * Flow 2 - Page 1: Gateway Screen (Role: Zero Waste Technician)
 * Route: partner.niwasi.in > Sign Up > Dashboard > Zero Waste
 * Main CTA: Purchase Kabaad
 */
export default function StaffGatewayScreen({ onStartKabadiEntry, onStartKabaadEntry, onBack }) {
  const handleStart = onStartKabaadEntry || onStartKabadiEntry;
  return (
    <div className="flex min-h-[520px] flex-col justify-between py-2 animate-fade-in">
      {/* Top Box: Flow Route */}
      <div className="rounded-2xl border border-stone-300/90 bg-white p-3.5 shadow-xs">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-mono text-[11px] font-semibold text-stone-800 leading-relaxed flex items-center justify-between">
          <div>
            <span className="text-stone-600">partner.niwasi.in</span>
            <span className="mx-1 text-stone-400">&gt;</span>
            <span className="text-stone-600">Dashboard</span>
            <span className="mx-1 text-stone-400">&gt;</span>
            <span className="text-sky-800 font-bold">Purchase Kabaad</span>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-[10px] font-bold text-stone-500 hover:text-ink underline"
            >
              Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Middle of Page: "Purchase Kabaad" Button */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <button
          type="button"
          onClick={handleStart}
          className="group flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-sky-700 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-sky-700/25 transition-all hover:bg-sky-800 hover:shadow-sky-700/35 active:scale-95"
        >
          <span>Purchase Kabaad</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:translate-x-1">
            <ArrowRight size={16} />
          </div>
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-xs font-semibold text-stone-500 hover:text-ink"
          >
            ← Return to Dashboard
          </button>
        )}
      </div>

      <div />
    </div>
  );
}
