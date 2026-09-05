# Zero Waste App — Project Context & Documentation

## 1. Overview

Zero Waste App is an operational dry waste (*Kabaad*) collection, field logistics, and rates management platform built for Sunai Consultancy. It handles doorstep scrap collection, real-time buy rates, generator customer management, and field technician operations.

The app runs on a normalized relational client database backed by `localStorage` (`sunai-partner-db-v2`), adhering strictly to the PostgreSQL schema defined in `docs/schema.sql`.

---

## 2. Core Concepts

* **Kabaad**: Commercial recyclable dry materials (paper/cardboard, plastics, metals, e-waste, glass) that carry monetary value. Citizens and businesses sell kabaad for instant cash or UPI payouts.
* **Waste Generators**: The entities producing dry waste, categorized into three canonical groups:
  * **Family**: Residential households, apartments, gated societies.
  * **Business**: Retail shops, offices, warehouses, restaurants.
  * **Public Spaces**: Parks, municipal zones, institutions.
* **Pickup Slots**: Fixed operational time windows for technician visits, with real-time status (`Available` / `Full`).
* **Pickup Tickets**: Scheduled doorstep collection requests linking waste generators with operational pickup slots.

---

## 3. User Roles & Interfaces

### A. Authentication & Punch-In (`StaffLoginScreen.jsx`)
* **Sign In**: Fully functional credential authentication against `staffUsers` table (matching `mobileNo` or staff `id` with `password`).
* **Role Redirection**: Authenticated staff are routed to their operational portal:
  * `technician` -> Mobile-optimized Technician Portal & Doorstep Collection Desk.
  * `data_operator` -> Enterprise Data Operator Management Console.
* **One-Click Staff Access**: Direct station access cards for active personnel (Vikram Singh STF-001, Pooja Sharma STF-003).

---

### B. Zero Waste Field Technician (`STF-001` — Vikram Singh)
Rendered in a mobile viewport shell (`TechnicianShell.jsx`):

1. **Dashboard (`TechnicianUnifiedDashboard.jsx`)**:
   * **Shift Metrics**: Pending visits count, total weight collected (kg), and cash/UPI paid out (₹).
   * **Ticket Queue**: Filterable list (Today, Upcoming, Completed) showing customer name, address, scheduled time slot, and estimated weight.
   * **Direct POS Launch**: Tapping any ticket opens the doorstep weighing screen.

2. **Customer Desk (Flow 2)**:
   * Search existing generator directory or register a new walk-in generator.
   * Configure kabaad intake mode: *Weigh at Pickup* (default, creates pending ticket) or *Add Items Now* (pre-calculated entry).
   * Assign dispatch slot and generate a confirmation ticket.

3. **Doorstep Scale POS (`PurchaseScreen.jsx`)**:
   * Weigh-in-place cart simulating certified digital scale input.
   * Select kabaad item, enter net weight, calculate line subtotals automatically.
   * Choose payment method (Cash or UPI) and generate final transaction receipt.

4. **Menu Tab (`TechnicianMenuTab.jsx`)**:
   * Technician profile details, digital scale connectivity status, shortcut to walk-in purchase POS, shift totals, and punch-out.

---

### C. Data Operator Console (`STF-003` — Pooja Sharma)
Rendered in an enterprise full-screen web layout (`DataOperatorWebView.jsx`) with an 8-tab top navigation bar:

1. **Dashboard (`OperatorDashboardTab.jsx`)**: Command center displaying key operational metrics (Total Requests, Master Items, Registered Generators, Active Slots), quick action shortcuts, and recent tickets feed.
2. **Tickets (`OperatorTicketsTab.jsx`)**: Full list of kabaad sell requests with status filters (All, Pending, Completed), search by customer/phone/ticket ID, ticket details modal, and ticket scheduling.
3. **Kabaad Catalogue (`OperatorCatalogueTab.jsx`)**: Catalog of recyclable materials grouped by category (Plastics, Paper, Metals, E-Waste, Glass), with search and item creation modal.
4. **Kabaad Prices (`OperatorPricesTab.jsx`)**: Live per-kg buy rate management. Supports direct inline editing, bulk percentage revisions (+5%, +10%, -5%, -10%, custom %), and timestamped price change audit logs.
5. **Add Waste Generator (`OperatorAddGeneratorTab.jsx`)**: Customer onboarding form (`name`, `phone`, `address`, `category`) paired with a searchable directory of existing generators.
6. **Waste Generators Category (`OperatorCategoriesTab.jsx`)**: Flat taxonomy manager matching `schema.sql` `(id, name, subCategory)`.
7. **Pickup Slots (`OperatorSlotsTab.jsx`)**: Master dispatch schedule windows with real-time toggle between *Available* and *Full*, and new slot creation `(date, day, timeWindow)`.
8. **User Profile (`OperatorProfileTab.jsx`)**: Operator station information, JSON database export backup tool, baseline state reload, and punch-out.

---

## 4. Data Layer & Schema Alignment

All application state conforms to `docs/schema.sql` and persists in browser `localStorage` under:
```
sunai-partner-db-v2
```

### Relational Schema
* `staffUsers`: `(id, name, mobileNo, password, role, isActive)`
* `wasteGroups`: `(id, name, description)`
* `wasteCategories`: `(id, groupId, name)`
* `masterItems`: `(id, categoryId, name, pricePerKg, defaultUnit)`
* `generators`: `(id, name, phone, address, category, lifetimeKG, totalPayout, outstandingDues)`
* `pickupSlots`: `(id, date, day, timeWindow, bookedKg, status)`
* `pickupTickets`: `(id, generatorId, slotId, status, estimatedWeight, notes, createdAt, completedAt)`
* `generatorCategories`: `(id, name, subCategory)`
* `transactions` & `transactionItems`: Immutable audit trail of completed purchases, including weight, price snapshot, total payout, and payment method.
* `priceAuditLog`: Historical record of rate modifications and bulk price adjustments.

### State Architecture
* **Store (`src/db/store.js`)**: Reactive state container backed by `useSyncExternalStore`.
* **Hooks (`src/db/useDb.js`)**: Custom React hook subscribing components to store changes.
* **Operations (`src/db/operations.js`)**: Atomic mutations (`recordPurchase`, `updateItemPrice`, `bulkAdjustPrices`, `createPickupTicket`, `registerGenerator`, `resetPartnerDb`).

---

## 5. Technology Stack

* **UI Framework**: React 18
* **Bundler & Tooling**: Vite 6
* **CSS Styling**: TailwindCSS 3
* **Icons**: Lucide React
* **State Management**: React Hooks + `useSyncExternalStore` + `localStorage`

---

## 6. Local Setup & Commands

### Prerequisites
* Node.js (v18 or higher recommended)
* npm

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The application opens at `http://localhost:5173` (or next available port).

### Build & Validate
```bash
# Production bundle
npm run build

# Preview build
npm run preview
```

---

## 7. Source Directory Structure

```
ZeroWasteApp/
├── src/
│   ├── components/
│   │   ├── auth/            # Staff login & punch-in screen
│   │   ├── layout/          # Technician shell & operator layout
│   │   ├── technician/      # Technician dashboard, POS, queue & menu
│   │   ├── operator/        # Data operator web view & tab modules
│   │   ├── staff/           # Customer desk & booking flow screens
│   │   └── shared/          # Reusable UI components & tags
│   ├── db/
│   │   ├── seed/            # Default JSON seed data
│   │   ├── operations.js    # Store mutation functions
│   │   ├── store.js         # Reactive localStorage store
│   │   └── useDb.js         # React hook for store access
│   ├── constants/           # Route and configuration constants
│   ├── utils/               # Formatting helpers
│   ├── App.jsx              # Main router & role state controller
│   ├── index.css            # Base stylesheet & Tailwind directives
│   └── main.jsx             # React entry point
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```
