import { useState, useMemo } from 'react';
import { MapPin, Search, X, Check, Users, Building, ShieldCheck } from 'lucide-react';

export default function CommunitySelectModal({
  isOpen,
  onClose,
  communities = [],
  selectedCommunityId,
  onSelectCommunity,
  generators = [],
}) {
  const [query, setQuery] = useState('');

  const filteredCommunities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.ward && c.ward.toLowerCase().includes(q)) ||
        (c.pincode && c.pincode.includes(q)) ||
        (c.zone && c.zone.toLowerCase().includes(q))
    );
  }, [communities, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-route-soft text-route">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-ink">
                Select Community
              </h3>
              <p className="text-[11px] text-ink-muted">
                Filter waste generators by locality in Patna
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-ink transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-stone-100 bg-stone-50/70">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search community name, ward, or PIN..."
              className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-ink placeholder-stone-400 focus:border-route focus:outline-none focus:ring-1 focus:ring-route"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-stone-400 hover:text-ink"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Community List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredCommunities.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted">
              No community matches "{query}"
            </div>
          ) : (
            filteredCommunities.map((com) => {
              const isSelected = com.id === selectedCommunityId;
              const count = generators.filter((g) => g.communityId === com.id).length;

              return (
                <button
                  key={com.id}
                  onClick={() => {
                    onSelectCommunity(com.id);
                    onClose();
                  }}
                  className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-route bg-route-soft/60 shadow-xs'
                      : 'border-stone-200/80 bg-white hover:border-route/40 hover:bg-stone-50/80'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-bold text-ink">
                        {com.name}
                      </span>
                      {com.ward && (
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted font-semibold">
                          {com.ward}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-ink-muted truncate max-w-[260px]">
                      {com.description || `${com.city} • PIN ${com.pincode}`}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[10px] text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users size={11} className="text-route" />
                        <strong className="font-mono text-ink">{count}</strong> registered
                      </span>
                      {com.technicianAssigned && (
                        <span className="text-stone-400">• Tech: {com.technicianAssigned}</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-route text-white shadow-xs">
                        <Check size={13} />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-stone-300" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 p-3 bg-stone-50 text-center">
          <p className="text-[10px] text-ink-muted">
            Tip: Filter by specific ward or locality to locate nearby generators quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
