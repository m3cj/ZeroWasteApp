import {
  X,
  Home,
  Recycle,
  Megaphone,
  Settings,
  Database,
  Warehouse,
  ShoppingBag,
  PhoneCall,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { SCREENS } from '../../constants';

export default function Sidebar({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  onResetDummyData,
}) {
  const [resetDone, setResetDone] = useState(false);

  const flows = [
    {
      id: SCREENS.KABAD_GATEWAY,
      number: '01',
      title: 'Sell Kabaad',
      role: 'Role: Zero Waste User',
      detail: 'Direct Scrap Sale Intake',
      icon: ShoppingBag,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: SCREENS.STAFF_GATEWAY,
      number: '02',
      title: 'Purchase Kabaad',
      role: 'Role: Zero Waste Technician',
      detail: 'Field Operations & Purchase POS',
      icon: PhoneCall,
      accentColor: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      id: SCREENS.DATA_OPERATOR,
      number: '03',
      title: 'Master Control Panel',
      role: 'Role: Data Operator',
      detail: 'Daily Rates & Category Master',
      icon: Database,
      accentColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      id: SCREENS.MRF_DASHBOARD,
      number: '04',
      title: 'MRF Dashboard',
      role: 'Role: Zero Waste Technician',
      detail: 'Material Recovery & MIS Reports',
      icon: Warehouse,
      accentColor: 'text-amber-900 bg-amber-50 border-amber-200',
    },
    {
      id: SCREENS.TECH_SEARCH,
      number: '05',
      title: 'Sukha Kura Pickup',
      role: 'Role: Zero Waste Technician',
      detail: 'Niwasi Campaign Doorstep Collection',
      icon: Recycle,
      accentColor: 'text-emerald-800 bg-emerald-100/60 border-emerald-300',
    },
    {
      id: SCREENS.UDYAMI_FORM,
      number: '06',
      title: 'Niwasi Interest Capture',
      role: 'Role: Samajik Udyami',
      detail: 'Shunya Kuda Citizen Outreach',
      icon: Megaphone,
      accentColor: 'text-stone-800 bg-stone-100 border-stone-300',
    },
  ];

  const handleReset = () => {
    if (onResetDummyData) {
      onResetDummyData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-stone-200 bg-[#FCFBF8] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-stone-200/90 px-5 py-4 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Recycle size={18} />
            </div>
            <div>
              <p className="font-heading text-base font-extrabold tracking-tight text-ink">
                Zero Waste
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Sunai Consultancy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-stone-100 hover:text-ink"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3.5">
          {/* Home Link */}
          <button
            onClick={() => {
              onNavigate(SCREENS.DASHBOARD);
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
              currentScreen === SCREENS.DASHBOARD
                ? 'bg-stone-900 text-white font-bold shadow-sm'
                : 'text-ink-light hover:bg-stone-100 hover:text-ink'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                currentScreen === SCREENS.DASHBOARD ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Home size={16} />
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold leading-tight">All Flows Dashboard</p>
              <p className={`text-[10px] ${currentScreen === SCREENS.DASHBOARD ? 'text-white/80' : 'text-ink-muted'}`}>
                Overview & Flow Directory
              </p>
            </div>
          </button>

          <div className="pt-2 pb-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
              Role Workflows (6 Flows)
            </p>
          </div>

          {flows.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentScreen === item.id ||
              (item.id === SCREENS.TECH_SEARCH && currentScreen.startsWith('technician-')) ||
              (item.id === SCREENS.UDYAMI_FORM && currentScreen.startsWith('udyami-')) ||
              (item.id === SCREENS.KABAD_ENTRY && currentScreen.startsWith('kabad-')) ||
              (item.id === SCREENS.STAFF_DESK && currentScreen.startsWith('staff-'));

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left border transition-all ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-800 text-white shadow-md font-bold'
                    : 'border-stone-200/70 bg-white text-ink-light hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.accentColor
                  }`}
                >
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-emerald-200' : 'text-emerald-800'}`}>
                      {item.number}.
                    </span>
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-ink'}`}>
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-100' : 'text-ink-muted'}`}>
                      {item.role}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Operational Database Section */}
          <div className="my-2 border-t border-stone-200 pt-3">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
              Operational Database
            </p>
            
            <button
              onClick={() => {
                onNavigate(SCREENS.SETTINGS);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                currentScreen === SCREENS.SETTINGS
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-ink-light hover:bg-stone-100 hover:text-ink'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  currentScreen === SCREENS.SETTINGS
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                <SlidersHorizontal size={15} />
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-bold leading-tight">Master Data Settings</p>
                <p
                  className={`text-[10px] ${
                    currentScreen === SCREENS.SETTINGS ? 'text-white/80' : 'text-ink-muted'
                  }`}
                >
                  Edit Generators, Items & Routes
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="mt-1.5 flex w-full items-center gap-3 rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-left text-xs font-semibold text-stone-700 transition hover:bg-stone-100 active:scale-98"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-200/70 text-stone-700">
                {resetDone ? <CheckCircle2 size={14} className="text-emerald-700" /> : <RotateCcw size={14} />}
              </div>
              <div className="flex-1 truncate">
                <p className="text-[11px] font-semibold">
                  {resetDone ? 'Database Reset!' : 'Reload Default State'}
                </p>
                <p className="text-[9px] text-stone-500">Restore factory baseline seeds</p>
              </div>
            </button>
          </div>
        </nav>

        {/* Footer / System Status */}
        <div className="border-t border-stone-200 bg-[#F6F4ED] p-3">
          <div className="flex items-center justify-between text-[11px] text-ink-muted px-1">
            <span>Zero Waste Platform</span>
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold">
              Live System
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

