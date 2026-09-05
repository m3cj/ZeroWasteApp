/**
 * Sticky floating bottom bar for mobile screens.
 * Ensures the primary CTA and running numbers are always within thumb reach.
 */
export default function StickyBottomBar({ children, className = '' }) {
  return (
    <div className="sticky-bar">
      <div className={`sticky-bar-inner ${className}`}>
        {children}
      </div>
    </div>
  );
}
