import { useState } from 'react';
import { X, Plus, CheckCircle } from 'lucide-react';
import { CATEGORY_META } from '../../constants';

export default function NewEntityModal({
  isOpen,
  onClose,
  communities = [],
  defaultCommunityId,
  onSaveEntity,
}) {
  const [communityId, setCommunityId] = useState(defaultCommunityId || communities[0]?.id || 'COM-001');
  const [category, setCategory] = useState('family');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('800020');
  const [city, setCity] = useState('Patna');
  const [kabadiAttached, setKabadiAttached] = useState(false);
  const [kabadiNotes, setKabadiNotes] = useState('');
  const [hasSpecialOrder, setHasSpecialOrder] = useState(false);
  const [specialOrderRemarks, setSpecialOrderRemarks] = useState('');

  if (!isOpen) return null;

  const activeCommunity = communities.find((c) => c.id === communityId) || communities[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !addressLine.trim()) return;

    const fullAddress = `${addressLine.trim()}${area ? `, ${area.trim()}` : ''}, ${city} - ${pincode}`;

    const newEntity = {
      communityId,
      communityName: activeCommunity?.name || 'Patna',
      category,
      name: name.trim(),
      ownerName: name.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      area: area.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      address: fullAddress,
      kabadiAttached,
      kabadiNotes: kabadiAttached ? kabadiNotes.trim() : '',
      specialOrderRemarks: hasSpecialOrder ? specialOrderRemarks.trim() : '',
      preferredSlots: ['Morning (8:00 AM - 11:00 AM)'],
      lastTransactionDate: null,
      outstandingDues: 0,
    };

    onSaveEntity(newEntity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-3.5">
          <h3 className="font-heading text-sm font-bold text-ink">
            Add Generator
          </h3>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
          >
            <X size={13} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
          <div>
            <label className="mobile-label">Community</label>
            <select
              value={communityId}
              onChange={(e) => {
                const cId = e.target.value;
                setCommunityId(cId);
                const matched = communities.find((c) => c.id === cId);
                if (matched?.pincode) setPincode(matched.pincode);
              }}
              className="mobile-input text-xs"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mobile-label">Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`rounded-xl border py-1.5 px-1 text-center font-semibold transition-all ${
                      isSelected
                        ? 'border-transparent text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-ink-muted'
                    }`}
                    style={{
                      backgroundColor: isSelected ? meta.color : undefined,
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mobile-label">Name</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mobile-input text-xs"
              />
            </div>

            <div>
              <label className="mobile-label">Number</label>
              <input
                type="tel"
                required
                placeholder="10-digit phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mobile-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="mobile-label">Address</label>
            <input
              type="text"
              required
              placeholder="Door, Street"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="mobile-input text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mobile-label">Area</label>
              <input
                type="text"
                placeholder="Area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mobile-input text-xs"
              />
            </div>
            <div>
              <label className="mobile-label">PIN</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="mobile-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="mobile-label">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mobile-input text-xs"
              />
            </div>
          </div>

          {/* Kabaad Toggle */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Kabaad Dealer Linked</span>
              <button
                type="button"
                onClick={() => setKabadiAttached(!kabadiAttached)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  kabadiAttached ? 'bg-ledger' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    kabadiAttached ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {kabadiAttached && (
              <input
                type="text"
                placeholder="Kabaad dealer details / schedule"
                value={kabadiNotes}
                onChange={(e) => setKabadiNotes(e.target.value)}
                className="mobile-input text-xs bg-white"
              />
            )}
          </div>

          {/* Special Order Toggle */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Special Order</span>
              <button
                type="button"
                onClick={() => setHasSpecialOrder(!hasSpecialOrder)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hasSpecialOrder ? 'bg-route' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    hasSpecialOrder ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasSpecialOrder && (
              <textarea
                rows={2}
                placeholder="Special order remarks"
                value={specialOrderRemarks}
                onChange={(e) => setSpecialOrderRemarks(e.target.value)}
                className="mobile-input text-xs bg-white"
              />
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={!name.trim() || !phone.trim() || !addressLine.trim()}
              className="btn-primary"
            >
              Save Generator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
