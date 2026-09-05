import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import CategoryTag from '../shared/CategoryTag';
import RegisterGeneratorModal from './RegisterGeneratorModal';

/** Search the generator directory for a walk-in, or register a brand-new one on the spot. */
export default function WalkInScreen({ generators, onSelectGenerator, onRegisterGenerator }) {
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return generators.filter(
      (g) => (g.name || g.ownerName || '').toLowerCase().includes(q) || g.phone.includes(q)
    );
  }, [generators, query]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-base font-bold text-ink">Walk-in desk</h2>
        <p className="text-xs text-ink-muted">Find an existing generator or register a new one.</p>
      </div>

      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or phone number"
          className="mobile-input pl-9 text-xs"
        />
      </div>

      {query.trim() && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <EmptyState title="No match" description="No generator with that name or number yet." />
          ) : (
            results.map((g) => (
              <button
                key={g.id}
                onClick={() => onSelectGenerator(g)}
                className="mobile-card-interactive flex w-full items-center justify-between text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-bold text-ink">{g.name || g.ownerName}</p>
                  <p className="truncate text-[11px] text-ink-muted">{g.phone} · {g.address || 'Patna'}</p>
                </div>
                <CategoryTag category={g.category} size="xs" />
              </button>
            ))
          )}
        </div>
      )}

      <button onClick={() => setModalOpen(true)} className="btn-secondary">
        <UserPlus size={15} />
        Register new walk-in
      </button>

      <RegisterGeneratorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onRegisterGenerator}
      />
    </div>
  );
}
