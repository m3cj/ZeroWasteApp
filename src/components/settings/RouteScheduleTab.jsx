import { useState } from 'react';
import { Plus, Trash2, Calendar, Check, Edit2, Building } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function RouteScheduleTab({ routeSchedule = [], setRouteSchedule }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newWard, setNewWard] = useState({
    ward: '',
    nextVisitDate: '2026-09-01',
  });
  const [editingWard, setEditingWard] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newWard.ward.trim()) return;

    setRouteSchedule((prev) => [
      ...prev,
      { ward: newWard.ward.trim(), nextVisitDate: newWard.nextVisitDate },
    ]);

    setNewWard({ ward: '', nextVisitDate: '2026-09-01' });
    setIsAdding(false);
  };

  const handleDateChange = (ward, newDate) => {
    setRouteSchedule((prev) =>
      prev.map((item) =>
        item.ward === ward ? { ...item, nextVisitDate: newDate } : item
      )
    );
  };

  const handleRemove = (ward) => {
    setRouteSchedule((prev) => prev.filter((item) => item.ward !== ward));
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-bold text-ink">Ward Schedules</h3>
          <p className="text-[11px] text-ink-muted">Next technician visit dates per route</p>
        </div>
        <button
          onClick={() => setIsAdding((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-xl bg-route px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-route-dark active:scale-95"
        >
          <Plus size={13} />
          <span>{isAdding ? 'Cancel' : 'Add Ward'}</span>
        </button>
      </div>

      {/* Add Ward Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border-2 border-route/30 bg-route-soft/40 p-4 shadow-sm space-y-3 animate-slide-up"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-route">
            New Ward Route Schedule
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mobile-label">Ward Identifier</label>
              <input
                type="text"
                placeholder="e.g. Ward 21"
                value={newWard.ward}
                onChange={(e) => setNewWard((prev) => ({ ...prev, ward: e.target.value }))}
                className="mobile-input text-xs"
                required
              />
            </div>

            <div>
              <label className="mobile-label">Next Visit Date</label>
              <input
                type="date"
                value={newWard.nextVisitDate}
                onChange={(e) =>
                  setNewWard((prev) => ({ ...prev, nextVisitDate: e.target.value }))
                }
                className="mobile-input text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary py-2.5 text-xs">
              Save Route
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-secondary py-2.5 text-xs w-auto px-4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Ward Cards List */}
      <div className="space-y-2.5">
        {routeSchedule.map((entry, index) => {
          const isEditing = editingWard === entry.ward;

          return (
            <div
              key={`${entry.ward}-${index}`}
              className="rounded-xl border border-stone-200/90 bg-white p-3.5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-route-soft text-route">
                    <Building size={16} />
                  </div>
                  <div>
                    <h4 className="font-heading text-xs font-bold text-ink">{entry.ward}</h4>
                    <p className="text-[10px] text-ink-muted">Assigned Route Area</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingWard(isEditing ? null : entry.ward)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                    title={isEditing ? 'Done' : 'Edit date'}
                  >
                    {isEditing ? <Check size={12} className="text-ledger" /> : <Edit2 size={12} />}
                  </button>

                  <button
                    onClick={() => handleRemove(entry.ward)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stamp/20 bg-stamp-soft text-stamp hover:bg-stamp hover:text-white"
                    title="Delete route"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Date Selector Row */}
              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <Calendar size={13} className="text-stone-400" />
                  <span>Scheduled Date</span>
                </div>

                {isEditing ? (
                  <input
                    type="date"
                    value={entry.nextVisitDate}
                    onChange={(e) => handleDateChange(entry.ward, e.target.value)}
                    className="rounded border border-stone-300 bg-white px-2 py-0.5 font-mono text-xs font-bold text-ink"
                  />
                ) : (
                  <span className="font-mono text-xs font-bold text-route">
                    {formatDate(entry.nextVisitDate)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
