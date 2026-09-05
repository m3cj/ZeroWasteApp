import { LayoutDashboard, Users, Menu } from 'lucide-react';

export default function TechnicianTopNav({
  activeTab = 'dashboard', // 'dashboard' | 'generator' | 'menu'
  onSelectTab,
  pendingCount = 0,
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'generator', label: 'Waste Generator', icon: Users },
    { id: 'menu', label: 'Menu', icon: Menu },
  ];

  return (
    <nav className="grid grid-cols-3 gap-1 rounded-2xl bg-black/20 p-1 font-mono text-xs text-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold transition-all ${
              isActive
                ? 'bg-white text-[#2C5F74] shadow-xs'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={14} />
            <span className="font-heading text-[11px] font-bold">{tab.label}</span>
            {tab.badge !== null && tab.badge !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold font-mono ${
                  isActive ? 'bg-[#2C5F74] text-white' : 'bg-amber-400 text-stone-900'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
