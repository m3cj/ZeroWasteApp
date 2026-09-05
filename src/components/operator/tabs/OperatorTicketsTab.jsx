import { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  CalendarDays,
  Scale,
  ArrowRight,
  ListPlus,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import {
  createPickupTicket,
  updateTicketStatus,
} from '../../../db/operations';
import GeneratorSearchSelector from '../../shared/GeneratorSearchSelector';
import GeneratorProfileCard from '../../shared/GeneratorProfileCard';
import CategoryTag from '../../shared/CategoryTag';
import KuraItemEntry from '../../shared/KuraItemEntry';

export default function OperatorTicketsTab({
  tickets = [],
  generators = [],
  slots = [],
  masterItems = [],
  wasteGroups = [],
  wasteCategories = [],
  subView = 'all', // 'all' | 'new-ticket'
  onSubViewChange,
  preselectedGeneratorId = null,
  currentStaff,
}) {
  const activeSubView = subView || 'all';
  const setActiveSubView = (view) => {
    if (onSubViewChange) onSubViewChange(view);
  };

  // ---------------------------------------------------------------------------
  // ALL TICKETS STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const triggerSuccessToast = (msg) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(''), 4000);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = ticket.id.toLowerCase().includes(q);
        const matchName = (
          ticket.generator?.name ||
          ticket.generator?.ownerName ||
          ''
        ).toLowerCase().includes(q);
        const matchPhone = ticket.generator?.phone?.includes(q);
        const matchAddress = ticket.generator?.address?.toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchAddress;
      }
      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  const handleStatusChange = (ticketId, nextStatus) => {
    updateTicketStatus(ticketId, nextStatus);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => ({ ...prev, status: nextStatus }));
    }
    triggerSuccessToast(`Ticket ${ticketId} updated to ${nextStatus}`);
  };

  // ---------------------------------------------------------------------------
  // NEW PICKUP TICKET FORM STATE
  // ---------------------------------------------------------------------------
  const [selectedGeneratorId, setSelectedGeneratorId] = useState(
    preselectedGeneratorId || generators[0]?.id || ''
  );

  // Sync when preselectedGeneratorId changes
  useEffect(() => {
    if (preselectedGeneratorId) {
      setSelectedGeneratorId(preselectedGeneratorId);
    }
  }, [preselectedGeneratorId]);

  const [selectedSlotId, setSelectedSlotId] = useState(slots[0]?.id || '');
  const [ticketIntakeMode, setTicketIntakeMode] = useState('quick'); // 'quick' | 'itemized'
  const [estimatedWeight, setEstimatedWeight] = useState(15);
  const [isEstimateAtPickup, setIsEstimateAtPickup] = useState(false);
  const [ticketItems, setTicketItems] = useState([]);
  const [ticketNotes, setTicketNotes] = useState('');

  const ticketItemsTotalWeight = useMemo(() => {
    return Math.round(ticketItems.reduce((sum, item) => sum + Number(item.weight || 0), 0) * 10) / 10;
  }, [ticketItems]);

  const handleAddTicketItem = (row) => {
    setTicketItems((prev) => [...prev, row]);
  };

  const handleRemoveTicketItem = (index) => {
    setTicketItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!selectedGeneratorId) {
      triggerSuccessToast('Please select a waste generator');
      return;
    }

    const isItemized = ticketIntakeMode === 'itemized' && ticketItems.length > 0;
    const finalWeight = isItemized
      ? ticketItemsTotalWeight
      : isEstimateAtPickup
      ? 0
      : Number(estimatedWeight) || 0;

    const created = createPickupTicket({
      generatorId: selectedGeneratorId,
      slotId: selectedSlotId || slots[0]?.id || 'SLOT-01',
      estimatedWeight: finalWeight,
      estimateAtPickup: isEstimateAtPickup && !isItemized,
      items: isItemized ? ticketItems : [],
      notes: ticketNotes,
    });

    triggerSuccessToast(`Pickup Ticket ${created.id} created successfully`);
    setActiveSubView('all');
    setTicketItems([]);
    setTicketNotes('');
    setIsEstimateAtPickup(false);
    setEstimatedWeight(15);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold text-ink tracking-tight">
              {activeSubView === 'all' ? 'Tickets' : 'New Pickup Ticket'}
            </h1>
            {activeSubView === 'all' && (
              <span className="font-mono text-xs text-stone-500 font-semibold">
                ({filteredTickets.length} of {tickets.length})
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-stone-500 mt-0.5">
            {activeSubView === 'all'
              ? 'Open dispatch queue for all field technicians'
              : 'Dispatch a scheduled scrap pickup request'}
          </p>
        </div>

        {/* Action Button: Strictly New Pickup Ticket toggle */}
        <div className="flex items-center gap-2">
          {activeSubView === 'all' ? (
            <button
              type="button"
              onClick={() => setActiveSubView('new-ticket')}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition"
            >
              <Plus size={15} />
              <span>New Pickup Ticket</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveSubView('all')}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-bold text-ink hover:bg-stone-100 transition"
            >
              <span>← Back to Tickets</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
          <CheckCircle2 size={16} />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUBVIEW 1: ALL TICKETS LIST                                         */}
      {/* =================================================================== */}
      {activeSubView === 'all' && (
        <div className="space-y-4">
          {/* Search Bar & Status Segmented Control */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by waste generator, phone, address, or ticket ID..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2 pl-10 pr-8 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-ink"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 font-mono text-xs shrink-0 border border-stone-200/60">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'completed', label: 'Completed' },
              ].map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`rounded-lg px-3 py-1 font-bold transition ${
                      active
                        ? 'bg-white text-ink shadow-2xs'
                        : 'text-stone-600 hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] font-bold text-stone-600">
                    <th className="px-5 py-3">Ticket ID</th>
                    <th className="px-5 py-3">Waste Generator</th>
                    <th className="px-5 py-3">Pickup Slot</th>
                    <th className="px-5 py-3">Est. Weight / Items</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => {
                      const isCompleted = ticket.status === 'completed';
                      const hasItems = ticket.items && ticket.items.length > 0;

                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className="hover:bg-stone-50/60 transition cursor-pointer"
                        >
                          <td className="px-5 py-3.5 font-mono font-bold text-ink">
                            <span className="rounded-md bg-stone-100 px-2 py-1 border border-stone-200/50">
                              {ticket.id}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <p className="font-heading font-bold text-ink truncate max-w-xs">
                                {ticket.generator?.name || ticket.generator?.ownerName || 'Waste Generator'}
                              </p>
                              {ticket.generator?.category && (
                                <CategoryTag category={ticket.generator.category} size="xs" />
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-stone-500 mt-0.5">
                              {ticket.generator?.phone || 'No phone'} • {ticket.generator?.address || 'Patna'}
                            </p>
                          </td>

                          <td className="px-5 py-3.5 font-mono">
                            <p className="font-bold text-ink">
                              {ticket.slot?.formattedDate || ticket.slot?.date || 'Scheduled'}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {ticket.slot?.timeRange || ticket.slot?.timeWindow || '8:00 AM - 11:00 AM'}
                            </p>
                          </td>

                          <td className="px-5 py-3.5 font-mono">
                            {hasItems ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-800">
                                <Scale size={11} />
                                <span>{ticket.estimatedWeight || 0} kg ({ticket.items.length} items)</span>
                              </span>
                            ) : ticket.estimateAtPickup || ticket.estimatedWeight === 0 ? (
                              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-600 font-medium">
                                Est. at pickup
                              </span>
                            ) : (
                              <span className="rounded-md bg-stone-100 px-2 py-0.5 font-bold text-ink">
                                ~{ticket.estimatedWeight || 15} kg
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                              <span>{ticket.status}</span>
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicket(ticket);
                              }}
                              className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-stone-200 transition"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-stone-500 font-medium">
                        No pickup tickets found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUBVIEW 2: NEW PICKUP TICKET FORM                                   */}
      {/* =================================================================== */}
      {activeSubView === 'new-ticket' && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs animate-fade-in space-y-6">
          <form onSubmit={handleCreateTicketSubmit} className="space-y-5 text-xs">
            {/* 1. Global Generator Search & Standard Profile Card */}
            <div className="rounded-2xl border border-stone-200/70 bg-stone-50/40 p-4 space-y-3">
              <GeneratorSearchSelector
                generators={generators}
                selectedGeneratorId={selectedGeneratorId}
                onSelect={(gen) => setSelectedGeneratorId(gen ? gen.id : '')}
                label="Waste Generator"
                placeholder="Search by Niwasi name, contact phone, or generator ID..."
                required
              />
            </div>

            {/* 2. Scheduled Pickup Slot */}
            <div>
              <label className="mb-1.5 block font-bold text-ink">
                Scheduled Pickup Slot <span className="text-primary">*</span>
              </label>
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-3 font-mono font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
              >
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.formattedDate || s.date} ({s.day}) • {s.timeRange || s.timeWindow} • Status: {s.status}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Dual Scrap Intake Choice: Quick Weight vs Itemized Entry */}
            <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50/30 p-4">
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
                <label className="font-bold text-ink flex items-center gap-1.5">
                  <Scale size={15} className="text-primary" />
                  <span>Scrap Intake Details</span>
                </label>

                {/* Intake Mode Switcher */}
                <div className="flex rounded-xl bg-stone-100 p-1 font-mono text-[11px] font-bold border border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setTicketIntakeMode('quick')}
                    className={`rounded-lg px-3 py-1 transition ${
                      ticketIntakeMode === 'quick'
                        ? 'bg-white text-ink shadow-2xs'
                        : 'text-stone-500 hover:text-ink'
                    }`}
                  >
                    Quick Estimate
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketIntakeMode('itemized')}
                    className={`rounded-lg px-3 py-1 transition ${
                      ticketIntakeMode === 'itemized'
                        ? 'bg-white text-primary shadow-2xs'
                        : 'text-stone-500 hover:text-ink'
                    }`}
                  >
                    Itemized Entry (Known Items)
                  </button>
                </div>
              </div>

              {/* Mode A: Quick Weight Estimate */}
              {ticketIntakeMode === 'quick' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-600 font-medium">
                      Specify approximate scrap weight or toggle estimate at pickup
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {[10, 20, 50, 100].map((wt) => (
                        <button
                          key={wt}
                          type="button"
                          disabled={isEstimateAtPickup}
                          onClick={() => setEstimatedWeight(wt)}
                          className="rounded-md border border-stone-200 bg-white px-2 py-0.5 hover:bg-stone-100 disabled:opacity-30 transition font-bold"
                        >
                          {wt}kg
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="2000"
                        disabled={isEstimateAtPickup}
                        value={isEstimateAtPickup ? 0 : estimatedWeight}
                        onChange={(e) => setEstimatedWeight(e.target.value)}
                        placeholder="Weight in kg"
                        className="w-full rounded-xl border border-stone-200 bg-white p-2.5 font-mono font-bold text-ink focus:border-primary focus:outline-none disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-stone-200 bg-white font-medium text-stone-700 hover:border-stone-300 transition select-none">
                      <input
                        type="checkbox"
                        checked={isEstimateAtPickup}
                        onChange={(e) => setIsEstimateAtPickup(e.target.checked)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs">Estimate weight at pickup (weight unknown)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Mode B: Itemized Kabaad Entry */}
              {ticketIntakeMode === 'itemized' && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-[11px] text-stone-500 font-mono">
                    Generator knows the specific waste items and weights they are selling.
                  </p>

                  <KuraItemEntry
                    masterItems={masterItems}
                    wasteGroups={wasteGroups}
                    wasteCategories={wasteCategories}
                    items={ticketItems}
                    onAddItem={handleAddTicketItem}
                    onRemoveItem={handleRemoveTicketItem}
                    title="Pre-Ticket Items Entry"
                  />

                  {ticketItems.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-mono text-xs text-emerald-800">
                      <span>Total Estimated Items: <strong>{ticketItems.length}</strong></span>
                      <span>Total Weight: <strong>{ticketItemsTotalWeight} kg</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label className="mb-1.5 block font-bold text-ink">Special Instructions / Location Notes</label>
              <textarea
                rows={2}
                value={ticketNotes}
                onChange={(e) => setTicketNotes(e.target.value)}
                placeholder="e.g. Call before coming, gate bell on 2nd floor, paper bundles tied..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-xs text-ink focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Form Submit & Cancel Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark active:scale-95 transition text-center"
              >
                Create Pickup Ticket →
              </button>
              <button
                type="button"
                onClick={() => setActiveSubView('all')}
                className="rounded-xl border border-stone-200 bg-white px-5 py-3.5 text-xs font-bold text-ink hover:bg-stone-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TICKET DETAILS MODAL                                                */}
      {/* =================================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Pickup Ticket
                </span>
                <h2 className="font-heading text-lg font-bold text-ink">
                  {selectedTicket.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Standard Generator Profile Card */}
            {selectedTicket.generator && (
              <GeneratorProfileCard generator={selectedTicket.generator} />
            )}

            {/* Scheduled Slot */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-xs font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Scheduled Dispatch Window
              </span>
              <p className="font-bold text-ink mt-1 text-sm">
                {selectedTicket.slot?.formattedDate || selectedTicket.slot?.date || 'Scheduled'} ({selectedTicket.slot?.day || ''})
              </p>
              <p className="text-stone-500 mt-0.5">
                {selectedTicket.slot?.timeRange || selectedTicket.slot?.timeWindow || '8:00 AM - 11:00 AM'}
              </p>
            </div>

            {/* Intake Weight / Items List */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-xs space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-stone-500">Intake Weight:</span>
                <span className="font-bold text-ink">
                  {selectedTicket.estimateAtPickup
                    ? 'Estimate at pickup (0 kg)'
                    : `~${selectedTicket.estimatedWeight || 0} kg`}
                </span>
              </div>

              {selectedTicket.items && selectedTicket.items.length > 0 && (
                <div className="border-t border-stone-200/60 pt-2 space-y-1 font-mono text-[11px]">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">
                    Itemized Scrap Manifest ({selectedTicket.items.length} items):
                  </span>
                  {selectedTicket.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-stone-700">
                      <span>{it.itemName || it.name}</span>
                      <span className="font-bold">{it.weight} kg • ₹{it.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedTicket.notes && (
                <div className="border-t border-stone-200/60 pt-2 text-stone-700">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">
                    Notes:
                  </span>
                  <p className="mt-0.5">{selectedTicket.notes}</p>
                </div>
              )}
            </div>

            {/* Status Change & Modal Actions */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-stone-500">Status:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      selectedTicket.id,
                      selectedTicket.status === 'completed' ? 'pending' : 'completed'
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                    selectedTicket.status === 'completed'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedTicket.status === 'completed' ? 'Reopen (Set Pending)' : 'Mark as Completed'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-ink hover:bg-stone-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
