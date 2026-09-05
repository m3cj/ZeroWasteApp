import { useState } from 'react';
import { Package, Users, Calendar, ArrowLeft, RefreshCw } from 'lucide-react';
import MasterItemsTab from './MasterItemsTab';
import GeneratorsTab from './GeneratorsTab';
import RouteScheduleTab from './RouteScheduleTab';

export default function SettingsScreen({
  settingsTab = 'masterItems',
  setSettingsTab,
  masterItems = [],
  setMasterItems,
  generators = [],
  setGenerators,
  routeSchedule = [],
  setRouteSchedule,
  onResetToDefaults,
}) {
  const [resetDone, setResetDone] = useState(false);

  const tabs = [
    { id: 'masterItems', label: 'Item Prices', count: masterItems.length, icon: Package },
    { id: 'generators', label: 'Generators', count: generators.length, icon: Users },
    { id: 'routeSchedule', label: 'Routes', count: routeSchedule.length, icon: Calendar },
  ];

  const handleReset = () => {
    if (onResetToDefaults) {
      onResetToDefaults();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            Master Configuration
          </p>
          <h2 className="font-heading text-xl font-bold tracking-tight text-ink">
            Database Settings
          </h2>
          <p className="text-xs text-ink-muted">
            Manage operational master data, scrap rates, and generator registry.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50 active:scale-95"
          title="Reset database to initial baseline state"
        >
          <RefreshCw size={13} className={resetDone ? 'text-emerald-700 animate-spin' : ''} />
          <span>{resetDone ? 'Reset Done' : 'Reset Data'}</span>
        </button>
      </div>


      {/* Segmented Pill Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-200/80 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = settingsTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`flex flex-col items-center justify-center rounded-lg py-2 text-center transition-all ${
                isActive
                  ? 'bg-white text-ink shadow-xs font-bold'
                  : 'text-ink-muted hover:text-ink font-medium'
              }`}
            >
              <div className="flex items-center gap-1">
                <Icon size={13} className={isActive ? 'text-route' : 'text-stone-400'} />
                <span className="text-xs">{tab.label}</span>
              </div>
              <span
                className={`text-[10px] font-mono ${
                  isActive ? 'text-route font-bold' : 'text-stone-400'
                }`}
              >
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      <div className="pt-1">
        {settingsTab === 'masterItems' && (
          <MasterItemsTab
            masterItems={masterItems}
            setMasterItems={setMasterItems}
          />
        )}

        {settingsTab === 'generators' && (
          <GeneratorsTab
            generators={generators}
            setGenerators={setGenerators}
            routeSchedule={routeSchedule}
          />
        )}

        {settingsTab === 'routeSchedule' && (
          <RouteScheduleTab
            routeSchedule={routeSchedule}
            setRouteSchedule={setRouteSchedule}
          />
        )}
      </div>
    </div>
  );
}
