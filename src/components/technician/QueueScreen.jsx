import { CheckCircle2, ChevronRight, Clock, MapPin, Scale } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import CategoryTag from '../shared/CategoryTag';

/**
 * The technician's pull queue for the day — a ledger row per ticket,
 * not a search box. This is the "push" workflow the old Staff Desk
 * (search-then-select) didn't have: tickets already know who's assigned.
 */
export default function QueueScreen({ tickets, onStartPurchase }) {
  const pending = tickets.filter((t) => t.status !== 'completed');
  const completed = tickets.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-base font-bold text-ink">Today's pickup queue</h2>
        <p className="text-xs text-ink-muted">Tap a ticket to start the doorstep purchase.</p>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Queue clear"
          description="No pending pickups assigned right now."
        />
      ) : (
        <div className="space-y-2.5">
          {pending.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onStartPurchase(ticket)}
              className="mobile-card-interactive flex w-full items-center gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-heading text-sm font-bold text-ink">
                    {ticket.generator?.ownerName}
                  </p>
                  <CategoryTag category={ticket.generator?.category} size="xs" />
                </div>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-muted">
                  <MapPin size={11} className="shrink-0" />
                  {ticket.generator?.address}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-route" />
                    {ticket.slot?.timeWindow || 'Any time'}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Scale size={11} className="text-ochre" />
                    ~{ticket.estimatedWeight} kg
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-ink-faint" />
            </button>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="mobile-label">Completed today</p>
          <div className="space-y-2">
            {completed.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-xl border border-stone-200/70 bg-stone-50/60 px-3.5 py-2.5"
              >
                <p className="text-xs font-semibold text-ink-light">{ticket.generator?.ownerName}</p>
                <span className="verified-badge">
                  <CheckCircle2 size={12} className="text-ledger" />
                  Done
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
