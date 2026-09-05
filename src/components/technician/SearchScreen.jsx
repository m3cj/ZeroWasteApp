import { useState, useMemo } from 'react';
import {
  Search,
  X,
  Plus,
  MapPin,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  ArrowRight,
  Phone,
  Store,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CATEGORY_META, SORT_OPTIONS } from '../../constants';
import CategoryTag from '../shared/CategoryTag';
import CommunitySelectModal from '../shared/CommunitySelectModal';
import NewEntityModal from '../shared/NewEntityModal';
import EmptyState from '../shared/EmptyState';
import { filterAndSortGenerators } from '../../utils/search';
import { formatDate, formatPhone, formatCurrency } from '../../utils/formatters';

export default function SearchScreen({
  searchQuery,
  setSearchQuery,
  selectedCommunityId,
  setSelectedCommunityId,
  communities = [],
  generators = [],
  onGeneratorSelected,
  onAddEntity,
}) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name_asc');
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isNewEntityModalOpen, setIsNewEntityModalOpen] = useState(false);

  // Active community details
  const activeCommunity = useMemo(
    () => communities.find((c) => c.id === selectedCommunityId) || communities[0] || null,
    [communities, selectedCommunityId]
  );

  // Filtered & sorted generators
  const matchingGenerators = useMemo(() => {
    return filterAndSortGenerators(generators, {
      query: searchQuery,
      communityId: selectedCommunityId,
      category: selectedCategoryFilter,
      sortBy: selectedSort,
    });
  }, [generators, searchQuery, selectedCommunityId, selectedCategoryFilter, selectedSort]);

  // Max 10 items listing requirement
  const PAGE_LIMIT = 10;
  const [page, setPage] = useState(1);
  const totalMatches = matchingGenerators.length;
  const displayedGenerators = matchingGenerators.slice(0, page * PAGE_LIMIT);

  // Count by category for this community
  const categoryCounts = useMemo(() => {
    const inCommunity = generators.filter((g) => g.communityId === selectedCommunityId);
    return {
      all: inCommunity.length,
      family: inCommunity.filter((g) => g.category === 'family').length,
      business: inCommunity.filter((g) => g.category === 'business').length,
      public: inCommunity.filter((g) => g.category === 'public').length,
    };
  }, [generators, selectedCommunityId]);

  return (
    <div className="relative space-y-3.5 pb-24 animate-fade-in min-h-[580px]">
      {/* Community Selector Bar (Modal Trigger) */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-route flex items-center gap-1 mb-1">
          <MapPin size={11} />
          <span>Active Community / Locality</span>
        </label>
        <button
          type="button"
          onClick={() => setIsCommunityModalOpen(true)}
          className="group flex w-full items-center justify-between rounded-2xl border-2 border-stone-200/90 bg-white p-3 shadow-card transition-all hover:border-route/50 hover:bg-stone-50/70 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-route text-white shadow-xs">
              <MapPin size={18} />
            </div>
            <div className="text-left truncate">
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-bold text-ink truncate">
                  {activeCommunity ? activeCommunity.name : 'Select Community'}
                </span>
                {activeCommunity?.ward && (
                  <span className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-muted">
                    {activeCommunity.ward}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-muted truncate">
                {activeCommunity?.pincode ? `PIN ${activeCommunity.pincode} • ` : ''}
                <strong className="font-mono text-route">{categoryCounts.all}</strong> generators registered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-2 text-route">
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Change</span>
            <ChevronDown size={18} className="text-stone-400 group-hover:text-route transition" />
          </div>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, or street..."
          className="mobile-input pl-9.5 pr-9 text-xs"
        />
        {searchQuery.trim().length > 0 && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-ink transition"
            aria-label="Clear search"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-stone-600">
              <X size={11} />
            </div>
          </button>
        )}
      </div>

      {/* Category Filter Pills (Family, Business, Public) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            selectedCategoryFilter === 'all'
              ? 'bg-route text-white shadow-xs'
              : 'border border-stone-200/90 bg-white text-ink-muted hover:bg-stone-50'
          }`}
        >
          All ({categoryCounts.all})
        </button>

        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const isSelected = selectedCategoryFilter === key;
          const count = categoryCounts[key] || 0;
          const Icon = meta.icon;

          return (
            <button
              key={key}
              onClick={() => setSelectedCategoryFilter(key)}
              className={`shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'border border-stone-200/90 bg-white text-ink-muted hover:bg-stone-50'
              }`}
              style={{
                backgroundColor: isSelected ? meta.color : undefined,
                borderColor: isSelected ? meta.color : undefined,
              }}
            >
              {Icon && <Icon size={12} className={isSelected ? 'text-white' : 'text-stone-400'} />}
              <span>{meta.label}</span>
              <span
                className={`font-mono text-[10px] rounded-full px-1.5 py-0.2 ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-stone-100 text-ink-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort & Results Summary Row */}
      <div className="flex items-center justify-between px-1 pt-1 text-xs">
        <span className="text-ink-muted font-medium">
          Showing <strong className="text-ink font-bold">{displayedGenerators.length}</strong> of{' '}
          <strong className="text-ink font-bold">{totalMatches}</strong> in {activeCommunity?.name}
        </span>

        {/* Sort selector */}
        <div className="flex items-center gap-1 text-ink-muted">
          <ArrowUpDown size={12} className="text-stone-400" />
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-semibold text-ink focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entity Listing (Max 10 shown per page) */}
      {matchingGenerators.length === 0 ? (
        <EmptyState
          title={
            searchQuery.trim()
              ? `No generators found for "${searchQuery}"`
              : `No generators registered in ${activeCommunity?.name}`
          }
          description="Try changing the category filter or use the + button to register a new generator."
        />
      ) : (
        <div className="space-y-2.5">
          {displayedGenerators.map((generator) => {
            const hasDues = Number(generator.outstandingDues || 0) > 0;

            return (
              <button
                key={generator.id}
                onClick={() => onGeneratorSelected(generator.id)}
                className="group flex w-full flex-col text-left rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-card transition-all duration-150 active:scale-[0.985] hover:border-route/50 hover:shadow-card-hover"
              >
                {/* Top: Name & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CategoryTag category={generator.category} showIcon={true} size="xs" />
                      {(generator.kabadiAttached || generator.kabaadAttached) && (
                        <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[9px] font-semibold text-amber-700">
                          Kabaad Linked
                        </span>
                      )}
                    </div>
                    <h4 className="font-heading text-sm font-bold text-ink group-hover:text-route transition-colors truncate">
                      {generator.name || generator.ownerName}
                    </h4>
                  </div>

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400 group-hover:bg-route/10 group-hover:text-route transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Address Line */}
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
                  <MapPin size={13} className="shrink-0 text-stone-400" />
                  <span className="truncate">{generator.address}</span>
                </div>

                {/* Bottom Row: Last Visit & Dues */}
                <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-ink-muted">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-ink-light">
                      <Phone size={10} className="text-stone-400" />
                      {formatPhone(generator.phone)}
                    </span>
                    <span className="text-stone-300">•</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={11} className="text-stone-400" />
                      <span>{formatDate(generator.lastTransactionDate)}</span>
                    </div>
                  </div>

                  {hasDues ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-stamp text-[10px] bg-stamp-soft px-1.5 py-0.5 rounded">
                      <AlertCircle size={10} />
                      Dues: ₹{generator.outstandingDues}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-ledger font-semibold">
                      Settled
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Pagination if > 10 */}
          {totalMatches > displayedGenerators.length && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-route hover:bg-stone-50 shadow-xs"
              >
                Load Next 10 Entities ({totalMatches - displayedGenerators.length} more)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating + Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 sm:absolute sm:bottom-4 sm:right-4">
        <button
          type="button"
          onClick={() => setIsNewEntityModalOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-route text-white shadow-xl shadow-route/40 transition-all duration-200 hover:scale-105 hover:bg-route-dark active:scale-95 focus:outline-none ring-4 ring-white"
          title="Add New Generator (Walk-in)"
          aria-label="Add New Generator"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Community Select Modal */}
      <CommunitySelectModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        communities={communities}
        selectedCommunityId={selectedCommunityId}
        onSelectCommunity={(cId) => {
          setSelectedCommunityId(cId);
          setPage(1);
        }}
        generators={generators}
      />

      {/* New Entity Modal */}
      <NewEntityModal
        isOpen={isNewEntityModalOpen}
        onClose={() => setIsNewEntityModalOpen(false)}
        communities={communities}
        defaultCommunityId={selectedCommunityId}
        onSaveEntity={onAddEntity}
      />
    </div>
  );
}
