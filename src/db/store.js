import { getSeedState } from './seedData';

const STORAGE_KEY = 'sunai-partner-db-v4';
const PREV_STORAGE_KEY = 'sunai-partner-db-v3';

let state = null;
const listeners = new Set();

function normalizeGenerator(gen) {
  return {
    id: gen.id,
    name: gen.name || gen.ownerName || 'Customer',
    phone: gen.phone || '',
    address: gen.address || '',
    category: gen.category || 'family',
    lifetimeKG: Number(gen.lifetimeKG ?? gen.lifetimeKg ?? 0),
    totalPayout: Number(gen.totalPayout ?? gen.totalPayouts ?? 0),
    outstandingDues: Number(gen.outstandingDues || 0),
  };
}

function normalizeSlot(slot) {
  return {
    id: slot.id,
    date: slot.date,
    day: slot.day || '',
    timeWindow: slot.timeWindow || slot.timeRange || '8:00 AM - 11:00 AM',
    bookedKg: Number(slot.bookedKg || 0),
    status: (slot.status || 'available').toLowerCase() === 'full' ? 'full' : 'available',
  };
}

function normalizeTicket(ticket) {
  return {
    id: ticket.id,
    generatorId: ticket.generatorId,
    slotId: ticket.slotId,
    status: ticket.status || 'pending',
    estimatedWeight: Number(ticket.estimatedWeight || 15),
    notes: ticket.notes || '',
    createdAt: ticket.createdAt || new Date().toISOString(),
    completedAt: ticket.completedAt || null,
  };
}

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(PREV_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const seed = getSeedState();

      // Normalize records against schema.sql
      const staffUsers = seed.staffUsers;
      const generators = (parsed.generators || seed.generators).map(normalizeGenerator);
      const pickupSlots = (parsed.pickupSlots || seed.pickupSlots).map(normalizeSlot);
      const pickupTickets = (parsed.pickupTickets || seed.pickupTickets).map(normalizeTicket);
      const generatorCategories = parsed.generatorCategories || seed.generatorCategories;

      return {
        ...parsed,
        ...seed, // Ensure new master catalog (wasteGroups, wasteCategories, masterItems) takes precedence
        staffUsers,
        generators,
        pickupSlots,
        pickupTickets,
        generatorCategories,
      };
    }
  } catch (e) {
    console.warn('Could not load partner DB from local storage', e);
  }
  return getSeedState();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not persist partner DB to local storage', e);
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

/** Lazily initializes state on first access so seed JSON only loads once. */
export function getState() {
  if (!state) state = loadInitial();
  return state;
}

/** Applies an atomic multi-table update. `mutator` receives the current state and returns the next state. */
export function commit(mutator) {
  state = mutator(getState());
  persist();
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetToSeed() {
  state = getSeedState();
  persist();
  notify();
}
