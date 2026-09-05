import staffUsers from './seed/staffUsers.json';
import wasteGroups from './seed/wasteGroups.json';
import wasteCategories from './seed/wasteCategories.json';
import masterItems from './seed/masterItems.json';
import generators from './seed/generators.json';
import pickupSlots from './seed/pickupSlots.json';
import pickupTickets from './seed/pickupTickets.json';
import generatorCategories from './seed/generatorCategories.json';

/**
 * Factory seed state for the whole relational store.
 * Tables with no seed rows still need to exist as empty arrays so
 * store operations can always assume the shape is present.
 */
export function getSeedState() {
  return {
    staffUsers: structuredClone(staffUsers),
    wasteGroups: structuredClone(wasteGroups),
    wasteCategories: structuredClone(wasteCategories),
    masterItems: structuredClone(masterItems),
    generators: structuredClone(generators),
    pickupSlots: structuredClone(pickupSlots),
    pickupTickets: structuredClone(pickupTickets),
    generatorCategories: structuredClone(generatorCategories),
    transactions: [],
    transactionItems: [],
    priceAuditLog: [],
    staffShifts: [],
  };
}
