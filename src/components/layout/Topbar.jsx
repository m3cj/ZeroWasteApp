import { Menu, Home, ArrowLeft, SlidersHorizontal, Sparkles } from 'lucide-react';
import { SCREENS } from '../../constants';

export default function Topbar({
  onToggleSidebar,
  onHome,
  currentScreen,
  onBack,
  title,
  onOpenSettings,
}) {
  const isDashboard = currentScreen === SCREENS.DASHBOARD;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-white/95 px-4 py-3 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {/* Left Action: Hamburger Menu on Home, or Back Button in Flows */}
        <div className="flex items-center">
          {!isDashboard && onBack ? (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-ink shadow-xs transition hover:bg-stone-50 active:scale-95"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <button
              onClick={onToggleSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-ink shadow-xs transition hover:bg-stone-50 active:scale-95"
              aria-label="Open menu"
              title="Open menu"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Center: "Zero Waste Prototype" (no flow1 or other title) */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <button 
            onClick={onHome} 
            className="group flex flex-col items-center focus:outline-none"
          >
            <span className="font-heading text-sm sm:text-base font-extrabold tracking-tight text-ink group-hover:text-emerald-700 transition-colors">
              Zero Waste
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Sunai Consultancy
            </span>
          </button>
        </div>

        {/* Right Action: Return Home or Settings / Dummy Data */}
        <div className="flex items-center gap-1.5">
          {!isDashboard ? (
            <button
              onClick={onHome}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-ink shadow-xs transition hover:bg-stone-50 active:scale-95"
              title="Return to Flow Directory"
              aria-label="Return to Dashboard"
            >
              <Home size={17} />
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-ink shadow-xs transition hover:bg-stone-50 active:scale-95"
              title="Master Data Settings"
              aria-label="Master Data Settings"
            >
              <SlidersHorizontal size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

