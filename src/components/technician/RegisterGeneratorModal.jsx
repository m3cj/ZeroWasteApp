import { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_META } from '../../constants';

/** Quick walk-in registration matching schema.sql (name, phone, address, category) */
export default function RegisterGeneratorModal({ isOpen, onClose, onSave }) {
  const [category, setCategory] = useState('family');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const canSubmit = name.trim() && phone.trim() && address.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave({
      category,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/60 backdrop-blur-xs sm:items-center animate-fade-in">
      <div className="w-full max-w-[420px] animate-slide-up overflow-hidden rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 p-3.5">
          <h3 className="font-heading text-sm font-bold text-ink">Register walk-in</h3>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
          >
            <X size={13} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 p-3.5 text-xs">
          <div>
            <label className="mobile-label">Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`rounded-xl border py-1.5 text-center font-semibold transition-all ${
                    category === key ? 'border-transparent text-white' : 'border-stone-200 bg-stone-50 text-ink-muted'
                  }`}
                  style={{ backgroundColor: category === key ? meta.color : undefined }}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mobile-label">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="mobile-input text-xs"
              />
            </div>
            <div>
              <label className="mobile-label">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit"
                required
                className="mobile-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="mobile-label">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Door, street, area"
              required
              className="mobile-input text-xs"
            />
          </div>

          <div className="pt-1">
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              Save & start purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
