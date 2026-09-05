import { BarChart3, Layers, LogOut, Tags, Users } from 'lucide-react';

const MODULES = [
  { key: 'rates', label: 'Rates', icon: BarChart3, enabled: true },
  { key: 'catalog', label: 'Catalog', icon: Layers, enabled: false },
  { key: 'slots', label: 'Slots', icon: Tags, enabled: false },
  { key: 'generators', label: 'Generators', icon: Users, enabled: false },
];

/**
 * Full-width desktop command center for the Data Operator — a real
 * register, not a phone frame stretched wide. Left rail switches modules;
 * only Rates is wired up so far, the rest preview the shape to come.
 */
export default function OperatorShell({ staff, activeModule, onNavigate, onLogout, children }) {
  return (
    <div className="min-h-screen w-full bg-[#EAE8E1]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] bg-[#FAF9F5] shadow-2xl">
        {/* Left rail */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-stone-200 bg-white">
          <div className="border-b border-stone-100 px-5 py-5">
            <p className="font-heading text-sm font-bold text-ink">Sunai Partner Desk</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">Data Operator console</p>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {MODULES.map(({ key, label, icon: Icon, enabled }) => {
              const isActive = activeModule === key;
              return (
                <button
                  key={key}
                  disabled={!enabled}
                  onClick={() => enabled && onNavigate(key)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-ledger-soft text-ledger'
                      : enabled
                      ? 'text-ink-light hover:bg-stone-50'
                      : 'text-ink-faint cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {label}
                  </span>
                  {!enabled && (
                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold text-ink-faint">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-stone-100 p-3">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-light hover:bg-stone-50"
            >
              <LogOut size={16} />
              Punch out
            </button>
            <p className="mt-2 px-3 text-[11px] text-ink-faint">{staff.name} · {staff.id}</p>
          </div>
        </aside>

        {/* Main pane */}
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
