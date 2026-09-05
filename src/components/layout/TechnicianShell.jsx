import { ArrowLeft } from 'lucide-react';
import TechnicianBottomNav from '../technician/TechnicianBottomNav';

/**
 * Mobile-first shell for Zero Waste Field Technician
 * - Top Nav: App Name "Zero Waste" centered, single Back button on left when necessary
 * - No user modal or profile icon in top nav
 * - Bottom Nav: Dashboard, Waste Generator, Menu
 */
export default function TechnicianShell({
  staff,
  todayStats,
  onLogout,
  showBack,
  onBack,
  activeTab = 'dashboard', // 'dashboard' | 'generator' | 'menu'
  onNavigate,
  children,
}) {
  return (
    <div className="min-h-screen w-full bg-[#EAE8E1] py-6 px-4 flex justify-center items-start">
      <div className="relative flex min-h-[840px] max-h-[92vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[36px] border-[5px] border-stone-800 bg-[#FAF9F5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]">
        {/* Top bar: Only App Name "Zero Waste" centered, Back button on left when needed */}
        <header className="bg-[#2C5F74] px-4 pt-5 pb-3.5 text-white shrink-0 shadow-sm flex items-center justify-between">
          <div className="w-8 flex items-center justify-start">
            {showBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-white"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
          </div>

          <h1 className="font-heading text-base font-bold tracking-tight text-white select-none text-center flex-1">
            Zero Waste
          </h1>

          {/* Right counter-balance spacer to keep "Zero Waste" perfectly centered */}
          <div className="w-8" />
        </header>

        {/* Screen Content Body */}
        <main className="flex-1 overflow-y-auto px-4 py-3.5">
          <div className="animate-fade-in">{children}</div>
        </main>

        {/* Bottom Nav Control for Mobile: Dashboard, Waste Generator, Menu */}
        <TechnicianBottomNav
          activeTab={activeTab}
          onSelectTab={onNavigate}
          pendingCount={todayStats?.pending || 0}
        />
      </div>
    </div>
  );
}
