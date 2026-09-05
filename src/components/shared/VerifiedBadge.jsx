import { BadgeCheck } from 'lucide-react';

/**
 * Signature anti-tampering verified badge.
 * Grounded in the field ledger visual language.
 */
export default function VerifiedBadge({ label = 'Verified price', size = 'sm', className = '' }) {
  const isLg = size === 'lg';

  return (
    <span
      className={`verified-badge ${
        isLg ? 'px-2.5 py-1 text-xs border-ledger/40 shadow-sm' : 'text-[11px]'
      } ${className}`}
    >
      <BadgeCheck size={isLg ? 15 : 13} className="shrink-0 text-ledger" />
      <span className="font-mono font-medium">{label}</span>
    </span>
  );
}
