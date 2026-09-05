import { WASTE_GROUP_SWATCH } from '../../constants';

/**
 * Material swatch pill for a waste group — the color is a stand-in for the
 * physical material (kraft brown for paper, gunmetal for ferrous, etc.),
 * so the same group always reads the same way across the whole app.
 */
export default function MaterialTag({ groupId, label, size = 'sm', className = '' }) {
  const swatch = WASTE_GROUP_SWATCH[groupId] || WASTE_GROUP_SWATCH['WG-01'];
  const isXs = size === 'xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${
        isXs ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      } ${className}`}
      style={{ borderColor: swatch.border, backgroundColor: swatch.bg, color: swatch.color }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: swatch.color }}
      />
      {label}
    </span>
  );
}
