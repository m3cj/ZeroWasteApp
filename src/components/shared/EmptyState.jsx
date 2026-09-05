import { Search } from 'lucide-react';

/**
 * Mobile-friendly clean empty state component.
 */
export default function EmptyState({
  icon: Icon = Search,
  title = 'No results found',
  description = 'Try searching with another keyword or check spelling.',
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-8 text-center backdrop-blur-xs ${className}`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        <Icon size={22} />
      </div>
      <p className="font-heading text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
