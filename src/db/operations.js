import { commit, resetToSeed } from './store';

const pad = (n, len) => String(n).padStart(len, '0');
const isoNow = () => new Date().toISOString();

function nextId(rows, prefix, len = 4) {
  return `${prefix}-${pad(rows.length + 1, len)}`;
}

/**
 * Records a doorstep purchase in one atomic commit:
 * inserts transaction + transactionItems matching schema.sql, closes ticket,
 * and updates generator's lifetime totals.
 */
export function recordPurchase({ ticketId, generatorId, technicianId, items, paymentMethod }) {
  let created = null;
  commit((state) => {
    const grandTotal = items.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const totalWeight = items.reduce((sum, row) => sum + Number(row.weight || 0), 0);
    const txnId = nextId(state.transactions, 'TXN-PUR-2026');
    const createdAt = isoNow();

    const transaction = {
      id: txnId,
      ticketId: ticketId || null,
      generatorId,
      technicianId,
      paymentMethod,
      grandTotal: Math.round(grandTotal * 100) / 100,
      createdAt,
    };

    const transactionItems = items.map((row, idx) => ({
      id: `${txnId}-L${idx + 1}`,
      transactionId: txnId,
      itemId: row.itemId || row.id,
      itemNameSnapshot: row.name || row.itemNameSnapshot,
      rateSnapshot: Number(row.rate || row.pricePerUnit || 0),
      weight: Number(row.weight || 0),
      amount: Math.round(Number(row.amount || 0) * 100) / 100,
    }));

    const pickupTickets = ticketId
      ? state.pickupTickets.map((t) =>
          t.id === ticketId ? { ...t, status: 'completed', completedAt: createdAt } : t
        )
      : state.pickupTickets;

    const generators = state.generators.map((g) =>
      g.id === generatorId
        ? {
            ...g,
            lifetimeKG: Math.round(((g.lifetimeKG ?? g.lifetimeKg ?? 0) + totalWeight) * 100) / 100,
            totalPayout: Math.round(((g.totalPayout ?? g.totalPayouts ?? 0) + grandTotal) * 100) / 100,
          }
        : g
    );

    created = { transaction, transactionItems };

    return {
      ...state,
      transactions: [transaction, ...state.transactions],
      transactionItems: [...transactionItems, ...state.transactionItems],
      pickupTickets,
      generators,
    };
  });
  return created;
}

/** Updates one item's rate and writes the audit trail row, atomically. */
export function updateItemPrice(itemId, newPrice, staffUserId) {
  commit((state) => {
    const item = state.masterItems.find((i) => i.id === itemId);
    if (!item || Number(item.pricePerUnit) === Number(newPrice)) return state;

    const auditRow = {
      id: nextId(state.priceAuditLog, 'AUD', 3),
      itemId,
      itemName: item.name,
      oldPrice: Number(item.pricePerUnit),
      newPrice: Number(newPrice),
      changedBy: staffUserId,
      changedAt: isoNow(),
    };

    return {
      ...state,
      masterItems: state.masterItems.map((i) =>
        i.id === itemId ? { ...i, pricePerUnit: Number(newPrice) } : i
      ),
      priceAuditLog: [auditRow, ...state.priceAuditLog],
    };
  });
}

/** Applies a percentage rate revision across chosen item IDs or a category, capturing a snapshot for instant undo */
export function bulkAdjustPrices(categoryId, percent, staffUserId, selectedItemIds = null) {
  commit((state) => {
    const factor = 1 + Number(percent) / 100;
    const changedAt = isoNow();
    const batchId = `BATCH-${Date.now()}`;
    const auditRows = [];
    const snapshot = [];

    const masterItems = state.masterItems.map((item) => {
      if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
        if (!selectedItemIds.includes(item.id)) return item;
      } else if (categoryId !== 'all' && item.categoryId !== categoryId) {
        return item;
      }

      const newPrice = Math.round(item.pricePerUnit * factor * 100) / 100;
      if (newPrice === item.pricePerUnit) return item;

      snapshot.push({
        id: item.id,
        pricePerUnit: Number(item.pricePerUnit),
      });

      auditRows.push({
        id: `AUD-BULK-${Date.now()}-${item.id}`,
        batchId,
        itemId: item.id,
        itemName: item.name,
        oldPrice: Number(item.pricePerUnit),
        newPrice,
        changedBy: staffUserId,
        changedAt,
      });

      return { ...item, pricePerUnit: newPrice };
    });

    return {
      ...state,
      masterItems,
      priceAuditLog: [...auditRows, ...state.priceAuditLog],
      lastBulkRevision: snapshot.length > 0 ? { batchId, snapshot, percent, categoryId, changedAt } : state.lastBulkRevision,
    };
  });
}

/** Reverts the last bulk price revision back to its previous rates */
export function revertLastBulkPriceRevision(staffUserId = 'STF-003') {
  let revertedCount = 0;
  commit((state) => {
    if (!state.lastBulkRevision || !state.lastBulkRevision.snapshot) {
      return state;
    }

    const { snapshot, batchId } = state.lastBulkRevision;
    const revertMap = new Map(snapshot.map((s) => [s.id, s.pricePerUnit]));
    const changedAt = isoNow();
    const revertAuditRows = [];

    const masterItems = state.masterItems.map((item) => {
      if (revertMap.has(item.id)) {
        const oldPrice = item.pricePerUnit;
        const restoredPrice = revertMap.get(item.id);
        revertedCount++;

        revertAuditRows.push({
          id: `AUD-REVERT-${Date.now()}-${item.id}`,
          batchId: `REVERT-${batchId}`,
          itemId: item.id,
          itemName: item.name,
          oldPrice,
          newPrice: restoredPrice,
          changedBy: staffUserId,
          changedAt,
          isRevert: true,
        });

        return { ...item, pricePerUnit: restoredPrice };
      }
      return item;
    });

    return {
      ...state,
      masterItems,
      priceAuditLog: [...revertAuditRows, ...state.priceAuditLog],
      lastBulkRevision: null,
    };
  });
  return revertedCount;
}

/** Registers a new waste generator matching schema.sql */
export function registerGenerator(entity) {
  let created = null;
  commit((state) => {
    created = {
      id: nextId(state.generators, 'GEN', 4),
      name: entity.name || entity.ownerName || 'Citizen',
      phone: entity.phone || '',
      address: entity.address || '',
      category: entity.category || 'family',
      lifetimeKG: 0,
      totalPayout: 0,
      outstandingDues: 0,
    };
    return { ...state, generators: [created, ...state.generators] };
  });
  return created;
}

/**
 * Creates a new pending pickup ticket matching schema.sql
 */
export function createPickupTicket({
  generatorId,
  slotId,
  estimatedWeight = 15,
  estimateAtPickup = false,
  items = [],
  notes = '',
}) {
  let created = null;
  commit((state) => {
    const ticketId = nextId(state.pickupTickets, 'TKT-2026', 4);
    const createdAt = isoNow();
    created = {
      id: ticketId,
      generatorId,
      slotId: slotId || state.pickupSlots[0]?.id || 'SLOT-01',
      status: 'pending',
      estimatedWeight: estimateAtPickup ? 0 : Number(estimatedWeight) || 0,
      estimateAtPickup: Boolean(estimateAtPickup),
      items: items || [],
      notes: notes || '',
      createdAt,
      completedAt: null,
    };
    return {
      ...state,
      pickupTickets: [created, ...state.pickupTickets],
    };
  });
  return created;
}

/** Updates status of a pickup ticket */
export function updateTicketStatus(ticketId, status) {
  commit((state) => ({
    ...state,
    pickupTickets: state.pickupTickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status,
            completedAt: status === 'completed' ? isoNow() : t.completedAt,
          }
        : t
    ),
  }));
}

/** Updates slot assignment of a pickup ticket */
export function updateTicketSlot(ticketId, slotId) {
  commit((state) => ({
    ...state,
    pickupTickets: state.pickupTickets.map((t) =>
      t.id === ticketId ? { ...t, slotId } : t
    ),
  }));
}

/** Adds an item to the master catalog */
export function addMasterItem(item) {
  let created = null;
  commit((state) => {
    const id = nextId(state.masterItems, 'ITM', 3);
    created = {
      id,
      categoryId: item.categoryId || 'WC-01',
      name: item.name,
      unit: item.unit || 'kg',
      pricePerUnit: Number(item.pricePerUnit) || 0,
      minQty: Number(item.minQty) || 1,
      isEnabled: true,
    };
    return {
      ...state,
      masterItems: [...state.masterItems, created],
    };
  });
  return created;
}

/** Deletes an item from the master catalog */
export function deleteMasterItem(itemId) {
  commit((state) => ({
    ...state,
    masterItems: state.masterItems.filter((i) => i.id !== itemId),
  }));
}

/** Adds a new pickup slot to the schedule */
export function addPickupSlot(slot) {
  let created = null;
  commit((state) => {
    const id = nextId(state.pickupSlots, 'SLOT', 2);
    created = {
      id,
      date: slot.date,
      day: slot.day || '',
      timeWindow: slot.timeWindow || slot.timeRange || '8:00 AM - 11:00 AM',
      bookedKg: Number(slot.bookedKg) || 0,
      status: (slot.status || 'available').toLowerCase() === 'full' ? 'full' : 'available',
    };
    return {
      ...state,
      pickupSlots: [...state.pickupSlots, created],
    };
  });
  return created;
}

/** Toggles a pickup slot between available and full */
export function togglePickupSlotStatus(slotId) {
  commit((state) => ({
    ...state,
    pickupSlots: state.pickupSlots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            status: (s.status || '').toLowerCase() === 'available' ? 'full' : 'available',
          }
        : s
    ),
  }));
}

/** Updates an existing pickup slot (date, day, timeWindow, status, bookedKg) */
export function updatePickupSlot(slotId, updates) {
  commit((state) => ({
    ...state,
    pickupSlots: state.pickupSlots.map((s) =>
      s.id === slotId ? { ...s, ...updates } : s
    ),
  }));
}

/** Deletes a pickup slot */
export function deletePickupSlot(slotId) {
  commit((state) => ({
    ...state,
    pickupSlots: state.pickupSlots.filter((s) => s.id !== slotId),
  }));
}

/** Adds a generatorCategory record (id, name, subCategory) */
export function addGeneratorCategory({ id, name, subCategory }) {
  let created = null;
  commit((state) => {
    const cats = state.generatorCategories || [];
    const catId = id || `CAT-${Date.now().toString().slice(-4)}`;
    created = {
      id: catId,
      name: name.trim(),
      subCategory: subCategory.trim(),
    };
    return {
      ...state,
      generatorCategories: [...cats, created],
    };
  });
  return created;
}

/** Deletes a generatorCategory record by id */
export function deleteGeneratorCategory(catId) {
  commit((state) => ({
    ...state,
    generatorCategories: (state.generatorCategories || []).filter((c) => c.id !== catId),
  }));
}

export function resetPartnerDb() {
  resetToSeed();
}
