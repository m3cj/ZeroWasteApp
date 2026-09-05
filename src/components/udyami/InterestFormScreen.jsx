import { MapPin, User, Phone, ArrowRight } from 'lucide-react';
import { CATEGORY_META } from '../../constants';

export default function InterestFormScreen({
  form,
  setForm,
  communities = [],
  onBack,
  onContinue,
}) {
  const isValid =
    Boolean(form.name?.trim()) &&
    Boolean(form.phone?.trim()) &&
    Boolean(form.addressLine?.trim()) &&
    Boolean(form.communityId);

  return (
    <div className="space-y-3.5 pb-12 animate-fade-in">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
        {/* Community Selector */}
        <div>
          <label className="mobile-label">Community</label>
          <select
            value={form.communityId || communities[0]?.id || ''}
            onChange={(e) => {
              const cId = e.target.value;
              const matched = communities.find((c) => c.id === cId);
              setForm((prev) => ({
                ...prev,
                communityId: cId,
                communityName: matched?.name || '',
                pincode: matched?.pincode || prev.pincode || '800020',
                ward: matched?.ward || '',
              }));
            }}
            className="mobile-input text-xs font-semibold"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Selection: Family, Business, Public */}
        <div>
          <label className="mobile-label">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const isSelected = (form.category || 'family') === key;
              const Icon = meta.icon;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: key }))}
                  className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-center transition-all ${
                    isSelected
                      ? 'border-transparent font-bold text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-ink-muted hover:bg-stone-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? meta.color : undefined,
                  }}
                >
                  {Icon && <Icon size={16} className="mb-0.5" />}
                  <span className="text-xs">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name & Phone */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mobile-label">Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={form.name || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mobile-input text-xs"
            />
          </div>

          <div>
            <label className="mobile-label">Number</label>
            <input
              type="tel"
              placeholder="10-digit number"
              value={form.phone || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="mobile-input text-xs font-mono"
            />
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <label className="mobile-label">Address</label>
          <input
            type="text"
            placeholder="House / Door / Street"
            value={form.addressLine || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, addressLine: e.target.value }))}
            className="mobile-input text-xs"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mobile-label">Area</label>
            <input
              type="text"
              placeholder="Area"
              value={form.area || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
              className="mobile-input text-xs"
            />
          </div>

          <div>
            <label className="mobile-label">PIN</label>
            <input
              type="text"
              placeholder="PIN"
              value={form.pincode || '800020'}
              onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))}
              className="mobile-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="mobile-label">City</label>
            <input
              type="text"
              value={form.city || 'Patna'}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              className="mobile-input text-xs"
            />
          </div>
        </div>

        {/* Kabaad Toggle */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Kabaad Dealer Linked</span>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, kabadiAttached: !prev.kabadiAttached }))}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.kabadiAttached ? 'bg-ledger' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  form.kabadiAttached ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {form.kabadiAttached && (
            <input
              type="text"
              placeholder="Kabaad dealer details / schedule"
              value={form.kabadiNotes || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, kabadiNotes: e.target.value }))}
              className="mobile-input text-xs bg-white mt-1"
              autoFocus
            />
          )}
        </div>

        {/* Special Order Toggle (Beneath Kabaad) */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Special Order</span>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, hasSpecialOrder: !prev.hasSpecialOrder }))}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.hasSpecialOrder ? 'bg-route' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  form.hasSpecialOrder ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {form.hasSpecialOrder && (
            <textarea
              rows={2}
              placeholder="Special order remarks"
              value={form.specialOrderRemarks || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, specialOrderRemarks: e.target.value }))}
              className="mobile-input text-xs bg-white mt-1"
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Save and Continue CTA */}
      <div>
        <button
          onClick={onContinue}
          disabled={!isValid}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <span>Save & Continue</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
