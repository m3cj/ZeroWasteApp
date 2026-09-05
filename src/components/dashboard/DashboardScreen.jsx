import {
  ShoppingBag,
  PhoneCall,
  Database,
  Warehouse,
  Recycle,
  Megaphone,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardScreen({
  onOpenKabad,
  onOpenStaffDesk,
  onOpenDataOperator,
  onOpenMRF,
  onOpenTechnician,
  onOpenUdyami,
  onOpenSettings,
  onResetDummyData,
}) {
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (onResetDummyData) {
      onResetDummyData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  const flows = [
    {
      id: 'flow-1',
      number: '1',
      title: 'Sell Kabaad',
      role: 'Role: Zero Waste User',
      detail: 'Direct scrap sale • Predefined pickup slots & live rates',
      icon: ShoppingBag,
      onClick: onOpenKabad,
      roleBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBgClass: 'bg-emerald-100/70 text-emerald-800',
      hoverBorderClass: 'hover:border-emerald-500',
    },
    {
      id: 'flow-2',
      number: '2',
      title: 'Purchase Kabaad',
      role: 'Role: Zero Waste Technician',
      detail: 'Field operations • Customer lookup, weighing & visit booking',
      icon: PhoneCall,
      onClick: onOpenStaffDesk,
      roleBadgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
      iconBgClass: 'bg-sky-100/70 text-sky-800',
      hoverBorderClass: 'hover:border-sky-500',
    },
    {
      id: 'flow-3',
      number: '3',
      title: 'Master Control Panel',
      role: 'Role: Data Operator',
      detail: 'DB master manager • Daily rates & category taxonomy',
      icon: Database,
      onClick: onOpenDataOperator,
      roleBadgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      iconBgClass: 'bg-indigo-100/70 text-indigo-800',
      hoverBorderClass: 'hover:border-indigo-500',
    },
    {
      id: 'flow-4',
      number: '4',
      title: 'Material Recovery Facility (MRF) Dashboard',
      role: 'Role: Zero Waste Technician',
      detail: 'MIS & MRF operations • Stock, Inward, Outward & Processed Kabaad sales',
      icon: Warehouse,
      onClick: onOpenMRF,
      roleBadgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
      iconBgClass: 'bg-amber-100/80 text-amber-900',
      hoverBorderClass: 'hover:border-amber-500',
    },
    {
      id: 'flow-5',
      number: '5',
      title: 'Sukha Kura Pickup',
      role: 'Role: Zero Waste Technician',
      detail: 'Niwasi campaign • Doorstep dry waste collection & payout',
      icon: Recycle,
      onClick: onOpenTechnician,
      roleBadgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBgClass: 'bg-teal-100/70 text-teal-800',
      hoverBorderClass: 'hover:border-teal-500',
    },
    {
      id: 'flow-6',
      number: '6',
      title: 'Niwasi Interest Capture',
      role: 'Role: Samajik Udyami',
      detail: 'Shunya Kuda promoter • Citizen outreach & visit schedule',
      icon: Megaphone,
      onClick: onOpenUdyami,
      roleBadgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
      iconBgClass: 'bg-stone-200/70 text-stone-800',
      hoverBorderClass: 'hover:border-stone-500',
    },
  ];


  return (
    <div className="space-y-4 pb-8 pt-1 animate-fade-in">
      {/* Header Info */}
      <div className="px-1">
        <h1 className="font-heading text-xl font-bold tracking-tight text-ink">
          Operations & Workflow Hub
        </h1>
        <p className="mt-0.5 text-xs text-ink-muted">
          Select an operational role below to access the live workflows.
        </p>
      </div>

      {/* The 5 Clean Particular Flow Cards */}
      <div className="space-y-2.5 pt-0.5">
        {flows.map((flow) => {
          const Icon = flow.icon;
          return (
            <button
              key={flow.id}
              type="button"
              onClick={flow.onClick}
              className={`group relative flex w-full items-center justify-between rounded-2xl border-2 border-stone-200/90 bg-white p-3.5 text-left shadow-xs transition-all duration-150 active:scale-[0.985] ${flow.hoverBorderClass} hover:shadow-md`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                {/* Flow Number + Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${flow.iconBgClass}`}
                >
                  <Icon size={20} />
                </div>

                {/* Card Content: Title, Role, One Small Detail */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-ink group-hover:text-emerald-800 transition-colors truncate">
                      {flow.number}. {flow.title}
                    </h3>
                  </div>

                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-block rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold ${flow.roleBadgeClass}`}
                    >
                      {flow.role}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-ink-muted truncate font-normal">
                    {flow.detail}
                  </p>
                </div>
              </div>

              {/* Arrow Cue */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition-transform group-hover:translate-x-0.5 group-hover:bg-stone-900 group-hover:text-white">
                <ArrowRight size={15} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Database Management Action Section */}
      <div className="pt-2">
        <div className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-stone-700" />
              <span className="text-xs font-bold text-ink">Database Management</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-xs transition hover:bg-stone-100 active:scale-95"
            >
              {resetDone ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  <span className="text-emerald-700 font-bold">Reset Done</span>
                </>
              ) : (
                <>
                  <RotateCcw size={12} />
                  <span>Reload Default State</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-stone-200/60 pt-2 text-[11px]">
            <span className="text-stone-500">Operational Database Connected</span>
            <button
              type="button"
              onClick={onOpenSettings}
              className="font-semibold text-emerald-800 hover:underline"
            >
              Edit Master Items & Rates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

