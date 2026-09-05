import { CATEGORY_META } from '../../constants';

/**
 * Category tag pill with dedicated color styling for Family, Business, Public.
 */
export default function CategoryTag({ category, showIcon = false, size = 'sm', className = '' }) {
  // Normalize legacy keys if any
  let normalizedKey = category;
  if (category === 'residential') normalizedKey = 'family';
  if (category === 'commercial' || category === 'industrial') normalizedKey = 'business';
  if (category === 'unauthorized') normalizedKey = 'public';

  const meta = CATEGORY_META[normalizedKey] || CATEGORY_META.family;
  const Icon = meta.icon;

  const isXs = size === 'xs';
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold uppercase tracking-[0.1em] transition-all ${
        isXs
          ? 'px-1.5 py-0.5 text-[9px]'
          : isSm
          ? 'px-2 py-0.5 text-[10px]'
          : 'px-2.5 py-1 text-xs'
      } ${className}`}
      style={{
        borderColor: meta.border,
        backgroundColor: meta.bg,
        color: meta.color,
      }}
    >
      {showIcon && Icon && <Icon size={isXs ? 10 : 12} className="shrink-0" />}
      <span>{meta.label}</span>
    </span>
  );
}
