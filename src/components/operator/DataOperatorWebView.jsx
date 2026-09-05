import { useState, useMemo } from 'react';
import {
  Recycle,
  LayoutDashboard,
  ClipboardList,
  Layers,
  Tag,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ShoppingBag,
} from 'lucide-react';

import OperatorDashboardTab from './tabs/OperatorDashboardTab';
import OperatorTicketsTab from './tabs/OperatorTicketsTab';
import OperatorPurchaseTab from './tabs/OperatorPurchaseTab';
import OperatorCatalogueTab from './tabs/OperatorCatalogueTab';
import OperatorPricesTab from './tabs/OperatorPricesTab';
import OperatorAddGeneratorTab from './tabs/OperatorAddGeneratorTab';
import OperatorSlotsTab from './tabs/OperatorSlotsTab';

/**
 * Full-Screen Web View Layout for Data Operator Console
 * Clean Grouped Sidebar Navigation:
 * - Brand: Zero Waste (role removed)
 * - Group: OPERATIONS (Dashboard, Tickets, Waste Generators, Pickup Slots)
 * - Group: KABAAD (Purchase Kabaad, Kabaad Catalogue, Kabaad Prices)
 */
export default function DataOperatorWebView({
  staff,
  db,
  enrichedMasterItems = [],
  enrichedSlots = [],
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'tickets' | 'generators' | 'slots' | 'purchase' | 'catalogue' | 'prices'
  const [ticketSubView, setTicketSubView] = useState('all'); // 'all' | 'new-ticket'
  const [preselectedGeneratorId, setPreselectedGeneratorId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Pre-join tickets with generators and slots for instant reactivity
  const ticketsWithDetails = useMemo(() => {
    return (db.pickupTickets || [])
      .map((t) => ({
        ...t,
        generator: (db.generators || []).find((g) => g.id === t.generatorId) || null,
        slot: enrichedSlots.find((s) => s.id === t.slotId) || null,
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [db.pickupTickets, db.generators, enrichedSlots]);

  const pendingTicketsCount = useMemo(() => {
    return ticketsWithDetails.filter((t) => t.status !== 'completed').length;
  }, [ticketsWithDetails]);

  // Direct tab navigation helper that can optionally select a subview & preselect generator
  const handleNavigate = (tabId, subView = 'all', generatorId = null) => {
    setActiveTab(tabId);
    if (tabId === 'tickets') {
      setTicketSubView(subView);
    }
    if (generatorId) {
      setPreselectedGeneratorId(generatorId);
    }
    setIsMobileSidebarOpen(false);
  };

  // Grouped Navigation Sections
  const navGroups = [
    {
      groupLabel: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'tickets',
          label: 'Tickets',
          icon: ClipboardList,
          badge: pendingTicketsCount > 0 ? pendingTicketsCount : null,
        },
        { id: 'generators', label: 'Waste Generators', icon: Users },
        { id: 'slots', label: 'Pickup Slots', icon: CalendarDays },
      ],
    },
    {
      groupLabel: 'Kabaad',
      items: [
        { id: 'purchase', label: 'Purchase Kabaad', icon: ShoppingBag },
        { id: 'catalogue', label: 'Kabaad Catalogue', icon: Layers },
        { id: 'prices', label: 'Kabaad Prices', icon: Tag },
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F7F6F2] flex flex-col lg:flex-row text-ink antialiased">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200/90 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <Recycle size={18} />
          </div>
          <span className="font-heading text-base font-bold tracking-tight text-ink">
            Zero Waste
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
          aria-label="Toggle navigation"
        >
          {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-10 w-64 bg-white border-r border-stone-200/90 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out h-screen ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header: Strictly 'Zero Waste', role removed */}
          <div className="px-5 py-5 border-b border-stone-100 flex items-center justify-between">
            <div
              onClick={() => handleNavigate('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs group-hover:scale-105 transition-transform">
                <Recycle size={20} />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-ink">
                Zero Waste
              </span>
            </div>
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-stone-400 hover:text-ink p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1">
            {navGroups.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                <div className="px-3.5 pt-2 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {group.groupLabel}
                </div>

                {group.items.map((item) => {
                  const active = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id, 'all')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-stone-600 hover:bg-stone-100/90 hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={16}
                          className={active ? 'text-white' : 'text-stone-400'}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                            active
                              ? 'bg-white/25 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Operator Profile Footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl border border-stone-200/70 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white font-mono">
                {staff?.name
                  ? staff.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                  : 'PS'}
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold text-ink truncate leading-tight">
                  {staff?.name || 'Pooja Sharma'}
                </p>
                <p className="font-mono text-[10px] text-stone-500 truncate leading-tight mt-0.5">
                  {staff?.id || 'STF-003'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent transition"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <OperatorDashboardTab
              db={db}
              enrichedItems={enrichedMasterItems}
              enrichedSlots={enrichedSlots}
              ticketsWithDetails={ticketsWithDetails}
              onNavigateTab={handleNavigate}
            />
          )}

          {activeTab === 'tickets' && (
            <OperatorTicketsTab
              tickets={ticketsWithDetails}
              generators={db.generators || []}
              slots={enrichedSlots}
              masterItems={enrichedMasterItems}
              wasteGroups={db.wasteGroups || []}
              wasteCategories={db.wasteCategories || []}
              subView={ticketSubView}
              onSubViewChange={setTicketSubView}
              preselectedGeneratorId={preselectedGeneratorId}
              currentStaff={staff}
            />
          )}

          {activeTab === 'purchase' && (
            <OperatorPurchaseTab
              generators={db.generators || []}
              masterItems={enrichedMasterItems}
              wasteGroups={db.wasteGroups || []}
              wasteCategories={db.wasteCategories || []}
              preselectedGeneratorId={preselectedGeneratorId}
              currentStaff={staff}
              onNavigateToTickets={() => handleNavigate('tickets', 'all')}
            />
          )}

          {activeTab === 'catalogue' && (
            <OperatorCatalogueTab
              masterItems={enrichedMasterItems}
              wasteGroups={db.wasteGroups || []}
              wasteCategories={db.wasteCategories || []}
            />
          )}

          {activeTab === 'prices' && (
            <OperatorPricesTab
              masterItems={enrichedMasterItems}
              wasteGroups={db.wasteGroups || []}
              wasteCategories={db.wasteCategories || []}
              priceAuditLog={db.priceAuditLog || []}
              currentStaff={staff}
            />
          )}

          {activeTab === 'generators' && (
            <OperatorAddGeneratorTab
              generators={db.generators || []}
              generatorCategories={db.generatorCategories || []}
              onBookPickupTicket={(generatorId) => {
                handleNavigate('tickets', 'new-ticket', generatorId);
              }}
              onDirectPurchase={(generatorId) => {
                handleNavigate('purchase', 'all', generatorId);
              }}
            />
          )}

          {activeTab === 'slots' && (
            <OperatorSlotsTab slots={enrichedSlots} />
          )}
        </div>
      </main>
    </div>
  );
}
