import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Flow 1 - Page 1: Gateway Screen
 * Route: niwasi.in > Zero Waste Service > niwasi.in/kabaad > Sign Up (Global Community)
 * Main CTA: Sell Kabaad
 */
export default function KabadGatewayScreen({ onStartSellKabad }) {
  return (
    <div className="flex min-h-[520px] flex-col justify-between py-2 animate-fade-in">
      {/* Top Box: Journey Path Trail */}
      <div className="rounded-2xl border border-stone-300/90 bg-white p-3.5 shadow-xs">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-mono text-[11px] font-semibold text-stone-800 leading-relaxed">
          <span className="text-stone-600">niwasi.in</span>
          <span className="mx-1 text-stone-400">&gt;</span>
          <span className="text-stone-600">Zero Waste Service</span>
          <span className="mx-1 text-stone-400">&gt;</span>
          <span className="text-stone-600">niwasi.in/kabaad</span>
          <span className="mx-1 text-stone-400">&gt;</span>
          <span className="text-emerald-800 font-bold">Sign Up (Global Community)</span>
        </div>
      </div>

      {/* Middle of Page: "Sell Kabaad" Button */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <button
          type="button"
          onClick={onStartSellKabad}
          className="group flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-emerald-700 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-700/25 transition-all hover:bg-emerald-800 hover:shadow-emerald-700/35 active:scale-95"
        >
          <span>Sell Kabaad</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:translate-x-1">
            <ArrowRight size={16} />
          </div>
        </button>
      </div>

      <div />
    </div>
  );
}
