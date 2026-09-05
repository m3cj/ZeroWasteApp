import { CATEGORY_META } from '../../constants';
import CategoryTag from '../shared/CategoryTag';
import { formatDate, formatPhone } from '../../utils/formatters';
import { MapPin, Phone, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export default function CategorizedResults({
  results = [],
  onSelectGenerator,
  searchQuery = '',
}) {
  const categoryKeys = Object.keys(CATEGORY_META);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Matching Generators ({results.length})
        </p>
      </div>

      {categoryKeys.map((categoryKey) => {
        const categoryResults = results.filter((g) => g.category === categoryKey);
        if (categoryResults.length === 0) return null;

        const meta = CATEGORY_META[categoryKey];

        return (
          <div key={categoryKey} className="space-y-2">
            {/* Category Header */}
            <div className="flex items-center gap-2 px-1">
              <CategoryTag category={categoryKey} showIcon={true} size="xs" />
              <span className="text-[11px] font-mono text-ink-muted">
                {categoryResults.length} match{categoryResults.length > 1 ? 'es' : ''}
              </span>
            </div>

            {/* Generator List Cards */}
            <div className="space-y-2">
              {categoryResults.map((generator) => {
                const hasDues = Number(generator.outstandingDues || 0) > 0;

                return (
                  <button
                    key={generator.id}
                    onClick={() => onSelectGenerator(generator.id)}
                    className="group flex w-full flex-col text-left rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-card transition-all active:scale-[0.985] hover:border-route/50 hover:shadow-card-hover"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-heading text-sm font-bold text-ink group-hover:text-route transition-colors">
                          {generator.ownerName}
                        </h4>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                          <MapPin size={13} className="shrink-0 text-stone-400" />
                          <span className="truncate">{generator.address}</span>
                        </div>
                      </div>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400 group-hover:bg-route/10 group-hover:text-route transition-colors">
                        <ArrowRight size={14} />
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-ink-muted">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} className="text-stone-400" />
                        <span>Last: {formatDate(generator.lastTransactionDate)}</span>
                      </div>
                      {hasDues && (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-stamp text-[10px]">
                          <AlertCircle size={10} />
                          Dues: ₹{generator.outstandingDues}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
