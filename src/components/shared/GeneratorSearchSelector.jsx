import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Building2, User, Phone, MapPin } from 'lucide-react';
import GeneratorProfileCard from './GeneratorProfileCard';
import CategoryTag from './CategoryTag';

/**
 * Global Waste Generator Search & Selector Component
 * Replaces standard dropdowns with a search across:
 * - Niwasi / Generator Name
 * - Phone / Contact
 * - User / Generator ID
 * - Address
 *
 * Upon selection, renders the standard GeneratorProfileCard.
 */
export default function GeneratorSearchSelector({
  generators = [],
  selectedGeneratorId = null,
  onSelect,
  label = 'Select Waste Generator',
  required = false,
  placeholder = 'Search by Niwasi name, phone / contact, or generator ID...',
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Current selected generator
  const selectedGenerator = useMemo(() => {
    return generators.find((g) => g.id === selectedGeneratorId) || null;
  }, [generators, selectedGeneratorId]);

  // Filter generators matching query
  const filteredGenerators = useMemo(() => {
    if (!query.trim()) {
      return generators.slice(0, 8); // Top 8 default when opened
    }
    const q = query.toLowerCase().trim();
    return generators.filter((g) => {
      const matchName = (g.name || g.ownerName || '').toLowerCase().includes(q);
      const matchPhone = (g.phone || '').includes(q);
      const matchId = (g.id || '').toLowerCase().includes(q);
      const matchAddress = (g.address || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchId || matchAddress;
    });
  }, [generators, query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChoose = (generator) => {
    if (onSelect) onSelect(generator);
    setIsOpen(false);
    setQuery('');
  };

  const handleClearSelection = () => {
    if (onSelect) onSelect(null);
    setQuery('');
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-ink">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {selectedGenerator && (
          <span className="font-mono text-[11px] text-stone-500 font-semibold">
            {selectedGenerator.id}
          </span>
        )}
      </div>

      {selectedGenerator ? (
        <GeneratorProfileCard
          generator={selectedGenerator}
          onChange={handleClearSelection}
        />
      ) : (
        <div ref={dropdownRef} className="relative">
          {/* Global Search Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              <Search size={16} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/80 py-3 pl-10 pr-10 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 transition shadow-2xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Predictive Search Dropdown Results */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-xl animate-fade-in divide-y divide-stone-100">
              <div className="px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-stone-400 flex justify-between">
                <span>Matching Generators ({filteredGenerators.length})</span>
                <span>Search: Niwasi / Contact / ID</span>
              </div>

              {filteredGenerators.length > 0 ? (
                filteredGenerators.map((gen) => (
                  <div
                    key={gen.id}
                    onClick={() => handleChoose(gen)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 transition cursor-pointer group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-bold text-ink group-hover:text-primary transition truncate">
                          {gen.name || gen.ownerName}
                        </span>
                        <CategoryTag category={gen.category} size="xs" />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-stone-500">
                        <span>{gen.phone || 'No phone'}</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{gen.address || 'Patna'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/60">
                        {gen.id}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-stone-500">
                  <p className="font-semibold">No waste generators found</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Try searching with mobile number or generator ID
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
