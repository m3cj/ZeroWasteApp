import { useMemo, useState } from 'react';
import { useDb } from './db/useDb';
import {
  recordPurchase,
  registerGenerator,
  createPickupTicket,
  resetPartnerDb,
  updateTicketSlot,
} from './db/operations';

import StaffLoginScreen from './components/auth/StaffLoginScreen';
import TechnicianShell from './components/layout/TechnicianShell';
import TechnicianUnifiedDashboard from './components/technician/TechnicianUnifiedDashboard';
import QuickUserProfile from './components/technician/QuickUserProfile';
import TechnicianMenuTab from './components/technician/TechnicianMenuTab';

import StaffDeskScreen from './components/staff/StaffDeskScreen';
import StaffItemEntryScreen from './components/staff/StaffItemEntryScreen';
import StaffSlotScreen from './components/staff/StaffSlotScreen';
import StaffSuccessScreen from './components/staff/StaffSuccessScreen';

import PurchaseScreen from './components/technician/PurchaseScreen';
import WalkInScreen from './components/technician/WalkInScreen';

import DataOperatorWebView from './components/operator/DataOperatorWebView';

const CURRENT_STAFF_KEY = 'sunai-partner-current-staff';

export default function App() {
  const db = useDb();

  const [currentStaffId, setCurrentStaffId] = useState(() => {
    try {
      return localStorage.getItem(CURRENT_STAFF_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  // Technician navigation states
  // Bottom Nav tabs: 'generator' (landing screen) | 'menu' (Dashboard preserved for future release)
  const [techTopTab, setTechTopTab] = useState('generator');
  const [isWalkInIntake, setIsWalkInIntake] = useState(false);

  // Quick User Profile state when a user card is clicked
  const [selectedTicketForProfile, setSelectedTicketForProfile] = useState(null);

  // Flow 2 (Waste Generator Customer Desk) sub-steps
  // Direct entry starts at 'desk' (Select Customer for Kabaad Purchase)
  const [flow2Step, setFlow2Step] = useState('desk'); // 'desk' | 'itemEntry' | 'slot' | 'success'
  const [staffEntry, setStaffEntry] = useState({
    entryMode: 'manual',
    items: [],
    name: '',
    category: 'family',
    phone: '',
    address: '',
    selectedSlotId: null,
    ticketId: null,
  });
  const [dispatchedBooking, setDispatchedBooking] = useState(null);

  // Fulfillment queue & POS states
  const [purchaseTarget, setPurchaseTarget] = useState(null); // { generator, ticket|null }
  const [receipt, setReceipt] = useState(null);

  const currentStaff = db.staffUsers.find((s) => s.id === currentStaffId) || null;

  const punchIn = (staffId) => {
    setCurrentStaffId(staffId);
    setTechTopTab('generator');
    setFlow2Step('desk');
    setPurchaseTarget(null);
    setSelectedTicketForProfile(null);
    setIsWalkInIntake(false);
    try {
      localStorage.setItem(CURRENT_STAFF_KEY, staffId);
    } catch (e) {}
  };

  const punchOut = () => {
    setCurrentStaffId(null);
    setPurchaseTarget(null);
    setSelectedTicketForProfile(null);
    setReceipt(null);
    setTechTopTab('generator');
    setFlow2Step('desk');
    setIsWalkInIntake(false);
    try {
      localStorage.removeItem(CURRENT_STAFF_KEY);
    } catch (e) {}
  };

  // ----- Normalized DB joins & enrichment matching schema.sql -----
  const enrichedMasterItems = useMemo(() => {
    const catMap = Object.fromEntries((db.wasteCategories || []).map((c) => [c.id, c]));
    const groupMap = Object.fromEntries((db.wasteGroups || []).map((g) => [g.id, g]));
    return (db.masterItems || []).map((item) => {
      const cat = catMap[item.categoryId];
      const grp = cat ? groupMap[cat.groupId] : null;
      return {
        ...item,
        groupId: grp?.id,
        groupIcon: grp?.icon || 'Boxes',
        wasteGroup: grp?.name || item.wasteGroup || 'Dry Waste',
        categoryId: cat?.id || item.categoryId,
        categoryIcon: cat?.icon || 'Layers',
        wasteCategory: cat?.name || item.wasteCategory || 'Plastic',
      };
    });
  }, [db.masterItems, db.wasteCategories, db.wasteGroups]);

  const enrichedSlots = useMemo(() => {
    return (db.pickupSlots || []).map((slot) => {
      const dateObj = new Date(slot.date);
      const formattedDate = !isNaN(dateObj)
        ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : slot.date;
      return {
        ...slot,
        formattedDate,
        timeRange: slot.timeWindow || '8:00 AM - 11:00 AM',
        status: (slot.status || '').toLowerCase() === 'full' ? 'Full' : 'Available',
      };
    });
  }, [db.pickupSlots]);

  // ----- Technician queue & today stats (Single Technician Vikram Singh) -----
  const technicianTickets = useMemo(() => {
    if (!currentStaff || currentStaff.role !== 'technician') return [];
    return (db.pickupTickets || [])
      .map((t) => ({
        ...t,
        generator: (db.generators || []).find((g) => g.id === t.generatorId) || null,
        slot: enrichedSlots.find((s) => s.id === t.slotId) || null,
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [db.pickupTickets, db.generators, enrichedSlots, currentStaff]);

  const todayStats = useMemo(() => {
    const pending = technicianTickets.filter((t) => t.status !== 'completed').length;
    const today = new Date().toISOString().slice(0, 10);
    const todaysTxns = (db.transactions || []).filter(
      (t) => t.technicianId === currentStaff?.id && t.createdAt.slice(0, 10) === today
    );
    const paidOut = todaysTxns.reduce((sum, t) => sum + t.grandTotal, 0);
    const collectedKg = (db.transactionItems || [])
      .filter((li) => todaysTxns.some((t) => t.id === li.transactionId))
      .reduce((sum, li) => sum + Number(li.weight), 0);
    return { pending, paidOut: Math.round(paidOut * 100) / 100, collectedKg: Math.round(collectedKg * 10) / 10 };
  }, [technicianTickets, db.transactions, db.transactionItems, currentStaff]);

  // ----- Flow 2 Handlers (Waste Generator Customer Desk) -----
  const handleResetFlow2 = () => {
    setStaffEntry({
      entryMode: 'manual',
      items: [],
      name: '',
      category: 'family',
      phone: '',
      address: '',
      selectedSlotId: null,
      ticketId: null,
    });
    setDispatchedBooking(null);
  };

  const handleConfirmFlow2Booking = (bookingData) => {
    const items = bookingData.items || [];
    const paymentMethod = bookingData.paymentMethod || 'cash';

    // Direct purchase with calculated items
    const result = recordPurchase({
      ticketId: bookingData.ticketId || null,
      generatorId: bookingData.generatorId,
      technicianId: currentStaff?.id || 'STF-001',
      items: items.map((item) => ({
        itemId: item.id || item.itemId,
        name: item.name,
        weight: item.weight,
        rate: item.pricePerUnit || item.rate,
        amount: item.subtotal || item.amount,
      })),
      paymentMethod,
    });

    const confirmed = {
      ...bookingData,
      paymentMethod,
      id: result?.transaction?.id || `TXN-PUR-${Date.now().toString().slice(-4)}`,
    };
    setDispatchedBooking(confirmed);
    setFlow2Step('success');
  };

  // ----- Quick User Profile & Ticket Selection Handlers -----
  const handleSelectTicket = (ticket) => {
    setSelectedTicketForProfile(ticket);
    setPurchaseTarget(null);
    setIsWalkInIntake(false);
  };

  // When clicking any user card from the Waste Generator directory -> directly open purchase kabaad screen
  const handleSelectGeneratorFromDesk = (generator) => {
    const existingTicket = technicianTickets.find(
      (t) => t.generatorId === generator.id && t.status !== 'completed'
    );
    const fullGenerator = (db.generators || []).find((g) => g.id === generator.id) || generator;
    const ticketObj = existingTicket || {
      id: `TKT-2026-${String(generator.id || '0001').replace(/\D/g, '').padStart(4, '0')}`,
      generatorId: generator.id,
      generator: fullGenerator,
      slotId: null, // No slot preselected
      slot: null,
      estimatedWeight: null,
      notes: '',
    };
    const currentSlot =
      ticketObj.slot ||
      (ticketObj.slotId ? enrichedSlots.find((s) => s.id === ticketObj.slotId) : null) ||
      null;

    setStaffEntry({
      entryMode: 'manual',
      items: [],
      name: fullGenerator.name || fullGenerator.ownerName || '',
      category: fullGenerator.category || 'family',
      phone: fullGenerator.phone || '',
      address: fullGenerator.address || '',
      selectedSlotId: currentSlot?.id || ticketObj.slotId || null,
      slotDay: currentSlot?.day || null,
      slotTime: currentSlot?.timeRange || null,
      timeRange: currentSlot?.timeRange || null,
      generatorId: fullGenerator.id,
      ticketId: ticketObj.id,
      ticket: ticketObj,
      generator: fullGenerator,
    });
    setSelectedTicketForProfile(null);
    setFlow2Step('itemEntry');
    setTechTopTab('generator');
  };

  // Direct Kabaad Entry without selecting any user (stag intake without profile link)
  const handleDirectKabaadEntry = () => {
    setStaffEntry({
      entryMode: 'stag',
      isStandalone: true,
      items: [],
      name: '',
      category: null,
      phone: '',
      address: '',
      selectedSlotId: null,
      slotDay: null,
      slotTime: null,
      timeRange: null,
      generatorId: null,
      ticketId: null,
      ticket: null,
      generator: null,
    });
    setSelectedTicketForProfile(null);
    setFlow2Step('itemEntry');
    setTechTopTab('generator');
  };

  const handleUpdateTicketSlot = (ticketId, slotId) => {
    updateTicketSlot(ticketId, slotId);
    const slot = slotId ? (enrichedSlots.find((s) => s.id === slotId) || null) : null;
    setSelectedTicketForProfile((prev) => {
      if (prev && prev.id === ticketId) {
        return { ...prev, slotId, slot };
      }
      return prev;
    });
    setStaffEntry((prev) => {
      if (prev && (prev.ticketId === ticketId || prev.ticket?.id === ticketId)) {
        return {
          ...prev,
          selectedSlotId: slotId,
          slotDay: slot?.day || null,
          slotTime: slot?.timeRange || null,
          timeRange: slot?.timeRange || null,
          ticket: prev.ticket ? { ...prev.ticket, slotId, slot } : prev.ticket,
        };
      }
      return prev;
    });
  };

  const handleProceedFromQuickProfileToFlow2 = (ticket, currentSlot) => {
    const generator = ticket.generator || {};
    setStaffEntry({
      entryMode: 'manual',
      items: [],
      name: generator.name || generator.ownerName || '',
      category: generator.category || 'family',
      phone: generator.phone || '',
      address: generator.address || '',
      selectedSlotId: currentSlot?.id || ticket.slotId || null,
      slotDay: currentSlot?.day,
      slotTime: currentSlot?.timeRange,
      timeRange: currentSlot?.timeRange,
      generatorId: generator.id,
      ticketId: ticket.id,
    });
    setSelectedTicketForProfile(null);
    setFlow2Step('itemEntry');
    setTechTopTab('generator');
  };

  // ----- Fulfillment Queue & Doorstep POS Handlers -----
  const handleStartFromTicket = (ticket) => {
    setPurchaseTarget({ generator: ticket.generator, ticket });
    setReceipt(null);
    setSelectedTicketForProfile(null);
  };

  const handleSelectWalkinGenerator = (generator) => {
    setPurchaseTarget({ generator, ticket: null });
    setReceipt(null);
    setIsWalkInIntake(false);
    setSelectedTicketForProfile(null);
  };

  const handleRegisterWalkin = (entityData) => {
    const generator = registerGenerator(entityData);
    return generator;
  };

  const handleConfirmPurchase = (cart, paymentMethod) => {
    if (!purchaseTarget || !currentStaff) return;
    const result = recordPurchase({
      ticketId: purchaseTarget.ticket?.id,
      generatorId: purchaseTarget.generator.id,
      technicianId: currentStaff.id,
      items: cart,
      paymentMethod,
    });
    setReceipt(result);
  };

  const handleDonePurchase = () => {
    setPurchaseTarget(null);
    setReceipt(null);
    setIsWalkInIntake(false);
    setSelectedTicketForProfile(null);
    setTechTopTab('generator');
  };

  // =========================================================================
  // Render: 1. Login Screen
  // =========================================================================
  if (!currentStaff) {
    return (
      <StaffLoginScreen
        staffUsers={db.staffUsers}
        onPunchIn={punchIn}
        onReset={resetPartnerDb}
      />
    );
  }

  // =========================================================================
  // Render: 2. Data Operator (Full Screen Web View)
  // =========================================================================
  if (currentStaff.role === 'data_operator') {
    return (
      <DataOperatorWebView
        staff={currentStaff}
        db={db}
        enrichedMasterItems={enrichedMasterItems}
        enrichedSlots={enrichedSlots}
        onLogout={punchOut}
      />
    );
  }

  // =========================================================================
  // Render: 3. Zero Waste Field Technician
  // =========================================================================
  return (
    <TechnicianShell
      staff={currentStaff}
      todayStats={todayStats}
      onLogout={punchOut}
      showBack={
        !!purchaseTarget ||
        isWalkInIntake ||
        !!selectedTicketForProfile ||
        techTopTab === 'menu' ||
        (techTopTab === 'generator' && flow2Step !== 'desk')
      }
      onBack={() => {
        if (purchaseTarget) {
          handleDonePurchase();
        } else if (selectedTicketForProfile) {
          setSelectedTicketForProfile(null);
        } else if (isWalkInIntake) {
          setIsWalkInIntake(false);
          setTechTopTab('generator');
        } else if (techTopTab === 'menu') {
          setTechTopTab('generator');
        } else if (techTopTab === 'generator') {
          if (flow2Step === 'itemEntry') {
            setSelectedTicketForProfile(null);
            handleResetFlow2();
            setFlow2Step('desk');
          } else if (flow2Step === 'slot') {
            setFlow2Step('itemEntry');
          } else if (flow2Step === 'success') {
            handleResetFlow2();
            setTechTopTab('generator');
          } else {
            setTechTopTab('generator');
          }
        }
      }}
      activeTab={techTopTab}
      onNavigate={(tab) => {
        setTechTopTab(tab);
        setSelectedTicketForProfile(null);
        if (tab === 'generator') {
          setIsWalkInIntake(false);
          setPurchaseTarget(null);
          handleResetFlow2();
          setFlow2Step('desk');
        } else if (tab === 'menu') {
          setIsWalkInIntake(false);
          setPurchaseTarget(null);
        } else {
          // dashboard or other
          setIsWalkInIntake(false);
          setPurchaseTarget(null);
        }
      }}
    >
      {/* 1. Doorstep Purchase POS Screen (Active Fulfillment / Weighing) */}
      {purchaseTarget ? (
        <PurchaseScreen
          generator={purchaseTarget.generator}
          masterItems={db.masterItems}
          wasteCategories={db.wasteCategories}
          wasteGroups={db.wasteGroups}
          receipt={receipt}
          onConfirm={handleConfirmPurchase}
          onDone={handleDonePurchase}
        />
      ) : selectedTicketForProfile ? (
        /* 2. Quick User Profile Component (Accessible from both tickets & generator directory) */
        <QuickUserProfile
          ticket={selectedTicketForProfile}
          slots={enrichedSlots}
          onUpdateSlot={handleUpdateTicketSlot}
          onProceedToFlow2={handleProceedFromQuickProfileToFlow2}
        />
      ) : isWalkInIntake ? (
        /* 3. Doorstep POS / Walk-in Customer Selection */
        <WalkInScreen
          generators={db.generators}
          onSelectGenerator={handleSelectWalkinGenerator}
          onRegisterGenerator={handleRegisterWalkin}
        />
      ) : techTopTab === 'dashboard' ? (
        /* 4. Dashboard (Daily/Monthly sliding bar + Pickup Ticket queue) */
        <TechnicianUnifiedDashboard
          staff={currentStaff}
          todayStats={todayStats}
          tickets={technicianTickets}
          onSelectTicket={handleSelectTicket}
        />
      ) : techTopTab === 'menu' ? (
        /* 5. Menu Tab */
        <TechnicianMenuTab
          staff={currentStaff}
          todayStats={todayStats}
          tickets={technicianTickets}
          transactions={db.transactions || []}
          onRegisterGenerator={handleRegisterWalkin}
          onSelectNewGenerator={(created) => {
            handleSelectGeneratorFromDesk(created);
          }}
          onLogout={punchOut}
        />
      ) : (
        /* 6. Waste Generator (Flow 2 - Customer Selection & Kabaad Intake) */
        <div className="space-y-4">
          {flow2Step === 'desk' && (
            <StaffDeskScreen
              staffEntry={staffEntry}
              setStaffEntry={setStaffEntry}
              generators={db.generators}
              onDirectKabaadEntry={handleDirectKabaadEntry}
              onProceedToItemEntry={(record) => {
                handleSelectGeneratorFromDesk(record);
              }}
              onProceedWithExistingUser={(record) => {
                handleSelectGeneratorFromDesk(record);
              }}
              onRegisterGenerator={handleRegisterWalkin}
              onBack={() => setTechTopTab('dashboard')}
            />
          )}

          {flow2Step === 'itemEntry' && (
            <StaffItemEntryScreen
              staffEntry={staffEntry}
              setStaffEntry={setStaffEntry}
              masterItems={enrichedMasterItems}
              wasteGroups={db.wasteGroups}
              wasteCategories={db.wasteCategories}
              slots={enrichedSlots}
              generators={db.generators}
              onUpdateSlot={handleUpdateTicketSlot}
              onProceedToSlot={() => setFlow2Step('slot')}
              onBack={() => {
                setSelectedTicketForProfile(null);
                handleResetFlow2();
                setFlow2Step('desk');
              }}
            />
          )}

          {flow2Step === 'slot' && (
            <StaffSlotScreen
              staffEntry={staffEntry}
              onConfirmBooking={handleConfirmFlow2Booking}
              onBack={() => setFlow2Step('itemEntry')}
            />
          )}

          {flow2Step === 'success' && (
            <StaffSuccessScreen
              booking={dispatchedBooking}
              onNewIntake={() => {
                handleResetFlow2();
                setFlow2Step('desk');
              }}
              onGoHome={() => {
                handleResetFlow2();
                setTechTopTab('generator');
              }}
            />
          )}
        </div>
      )}
    </TechnicianShell>
  );
}
