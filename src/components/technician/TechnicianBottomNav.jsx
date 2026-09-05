import { LayoutDashboard, Users, Menu } from 'lucide-react';

export default function TechnicianBottomNav({
  activeTab = 'dashboard', // 'dashboard' | 'generator' | 'menu'
  onSelectTab,
  pendingCount = 0,
}) {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'generator',
      label: 'Waste Generator',
      icon: Users,
      badge: null,
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      badge: null,
    },
  ];

  return (
    <nav className="shrink-0 border-t border-stone-200/80 bg-white/95 backdrop-blur-md px-3 py-2">
      <div className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-2 transition-all ${
                isActive
                  ? 'text-[#2C5F74] font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className={isActive ? 'text-[#2C5F74]' : 'text-stone-500'}
                />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 font-mono text-[9px] font-bold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="font-heading text-[10.5px] leading-none tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-[#2C5F74]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
