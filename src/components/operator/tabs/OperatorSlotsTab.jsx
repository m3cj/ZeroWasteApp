import { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Edit2,
  Check,
} from 'lucide-react';
import {
  addPickupSlot,
  updatePickupSlot,
  togglePickupSlotStatus,
  deletePickupSlot,
} from '../../../db/operations';

export default function OperatorSlotsTab({ slots = [] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const [newSlotForm, setNewSlotForm] = useState({
    day: 'Monday',
    date: '2026-09-07',
    timeWindow: '8:00 AM - 11:00 AM',
    status: 'available',
  });

  const [editSlotForm, setEditSlotForm] = useState({
    day: '',
    date: '',
    timeWindow: '',
    status: 'available',
    bookedKg: 0,
  });

  const handleCreateSlot = (e) => {
    e.preventDefault();
    const created = addPickupSlot({
      date: newSlotForm.date,
      day: newSlotForm.day,
      timeWindow: newSlotForm.timeWindow,
      status: newSlotForm.status,
    });
    setIsAddModalOpen(false);
    showToast(`Slot ${created.id} created successfully`);
  };

  const handleStartEdit = (slot) => {
    setEditingSlot(slot);
    setEditSlotForm({
      day: slot.day || 'Monday',
      date: slot.date || '',
      timeWindow: slot.timeRange || slot.timeWindow || '8:00 AM - 11:00 AM',
      status: (slot.status || 'available').toLowerCase() === 'full' ? 'full' : 'available',
      bookedKg: Number(slot.bookedKg || 0),
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSlot) return;

    updatePickupSlot(editingSlot.id, {
      date: editSlotForm.date,
      day: editSlotForm.day,
      timeWindow: editSlotForm.timeWindow,
      status: editSlotForm.status,
      bookedKg: Number(editSlotForm.bookedKg || 0),
    });

    showToast(`Slot ${editingSlot.id} updated successfully`);
    setEditingSlot(null);
  };

  const handleToggle = (slotId) => {
    togglePickupSlotStatus(slotId);
  };

  const handleDelete = (slotId) => {
    if (window.confirm('Delete this pickup slot?')) {
      deletePickupSlot(slotId);
      showToast(`Slot ${slotId} deleted`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <h1 className="font-heading text-xl font-bold text-ink tracking-tight">
            Pickup Slots
          </h1>
          <p className="font-mono text-xs text-stone-500 mt-0.5">
            {slots.length} operational dispatch windows available for technicians
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Pickup Slot</span>
        </button>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => {
          const isAvailable = (slot.status || 'available').toLowerCase() === 'available';

          return (
            <div
              key={slot.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3"
            >
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-mono text-xs font-bold text-ink">{slot.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(slot.id)}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Click to toggle availability"
                    >
                      {isAvailable ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      <span>{slot.status}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1 font-mono text-xs">
                  <p className="font-bold text-ink text-sm">
                    {slot.formattedDate || slot.date} ({slot.day})
                  </p>
                  <p className="text-stone-500 flex items-center gap-1.5">
                    <Clock size={12} className="text-stone-400" />
                    <span>{slot.timeRange || slot.timeWindow}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 font-mono text-xs">
                <span className="text-stone-500 text-[11px]">
                  Booked: <strong className="text-ink">{slot.bookedKg || 0} kg</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(slot)}
                    className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition"
                    title="Edit Slot"
                  >
                    <Edit2 size={12} className="text-stone-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(slot.id)}
                    className="rounded-lg p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Slot"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-heading text-base font-bold text-ink">
                Add Pickup Slot
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-ink">Date</label>
                <input
                  type="date"
                  required
                  value={newSlotForm.date}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, date: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Day of Week</label>
                <select
                  value={newSlotForm.day}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, day: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Time Window</label>
                <select
                  value={newSlotForm.timeWindow}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, timeWindow: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                >
                  <option value="8:00 AM - 11:00 AM">8:00 AM - 11:00 AM (Morning)</option>
                  <option value="11:30 AM - 2:30 PM">11:30 AM - 2:30 PM (Midday)</option>
                  <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM (Afternoon)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Status</label>
                <select
                  value={newSlotForm.status}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, status: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="full">Full</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 font-bold text-white hover:bg-primary-dark transition shadow-xs"
                >
                  Save Slot
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 font-bold text-ink hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-heading text-base font-bold text-ink">
                  Edit Pickup Slot ({editingSlot.id})
                </h2>
                <p className="font-mono text-xs text-stone-500 mt-0.5">
                  Update dispatch timing, date, and availability status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-ink">Date</label>
                <input
                  type="date"
                  required
                  value={editSlotForm.date}
                  onChange={(e) => setEditSlotForm({ ...editSlotForm, date: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Day of Week</label>
                <select
                  value={editSlotForm.day}
                  onChange={(e) => setEditSlotForm({ ...editSlotForm, day: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-ink">Time Window</label>
                <select
                  value={editSlotForm.timeWindow}
                  onChange={(e) => setEditSlotForm({ ...editSlotForm, timeWindow: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                >
                  <option value="8:00 AM - 11:00 AM">8:00 AM - 11:00 AM (Morning)</option>
                  <option value="11:30 AM - 2:30 PM">11:30 AM - 2:30 PM (Midday)</option>
                  <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM (Afternoon)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-ink">Status</label>
                  <select
                    value={editSlotForm.status}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, status: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="full">Full</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-ink">Booked Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={editSlotForm.bookedKg}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, bookedKg: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 font-mono font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 font-bold text-white hover:bg-primary-dark transition shadow-xs"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 font-bold text-ink hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
