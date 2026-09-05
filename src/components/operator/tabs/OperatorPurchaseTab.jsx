import { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Scale,
  Printer,
  RotateCcw,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { recordPurchase } from '../../../db/operations';
import GeneratorSearchSelector from '../../shared/GeneratorSearchSelector';
import KuraItemEntry from '../../shared/KuraItemEntry';

/**
 * Dedicated Purchase Kabaad Intake Desk (Shifted into Kabaad Group)
 * Features:
 * - Global Generator Search (Niwasi, Contact, ID)
 * - Standard GeneratorProfileCard
 * - Hierarchical KuraItemEntry
 * - Payment Settlement (Cash, UPI, Due)
 * - Formal Transaction Receipt
 */
export default function OperatorPurchaseTab({
  generators = [],
  masterItems = [],
  wasteGroups = [],
  wasteCategories = [],
  preselectedGeneratorId = null,
  currentStaff,
  onNavigateToTickets,
}) {
  const [selectedGenId, setSelectedGenId] = useState(
    preselectedGeneratorId || generators[0]?.id || ''
  );

  // Sync when preselectedGeneratorId changes (e.g. via quick action)
  useEffect(() => {
    if (preselectedGeneratorId) {
      setSelectedGenId(preselectedGeneratorId);
    }
  }, [preselectedGeneratorId]);

  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi' | 'due'
  const [receipt, setReceipt] = useState(null);

  const selectedGenerator = useMemo(() => {
    return generators.find((g) => g.id === selectedGenId) || null;
  }, [generators, selectedGenId]);

  const cartTotalWeight = useMemo(() => {
    return Math.round(cartItems.reduce((sum, item) => sum + Number(item.weight || 0), 0) * 10) / 10;
  }, [cartItems]);

  const cartGrandTotal = useMemo(() => {
    return Math.round(cartItems.reduce((sum, item) => sum + Number(item.amount || item.subtotal || 0), 0) * 100) / 100;
  }, [cartItems]);

  const handleAddCartItem = (row) => {
    setCartItems((prev) => [...prev, row]);
  };

  const handleRemoveCartItem = (index) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmPurchase = (e) => {
    e.preventDefault();
    if (!selectedGenerator || cartItems.length === 0) return;

    const res = recordPurchase({
      ticketId: null,
      generatorId: selectedGenerator.id,
      technicianId: currentStaff?.id || 'STF-003',
      items: cartItems,
      paymentMethod,
    });

    setReceipt(res);
    setCartItems([]);
  };

  const handleReset = () => {
    setReceipt(null);
    setCartItems([]);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold text-ink tracking-tight">
              Purchase Kabaad
            </h1>
            <span className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg font-bold">
              Direct Intake Desk
            </span>
          </div>
          <p className="font-mono text-xs text-stone-500 mt-0.5">
            Doorstep scrap purchase, instant weighing & payment settlement
          </p>
        </div>
      </div>

      {!receipt ? (
        <div className="space-y-4">
          {/* 1. Global Waste Generator Search with Profile Card */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <GeneratorSearchSelector
              generators={generators}
              selectedGeneratorId={selectedGenId}
              onSelect={(gen) => setSelectedGenId(gen ? gen.id : '')}
              label="Waste Generator (Niwasi / Commercial / Public Entity)"
              placeholder="Search by Niwasi name, phone / contact number, or ID..."
              required
            />
          </div>

          {/* 2. Standard Kabaad Items Entry */}
          <KuraItemEntry
            masterItems={masterItems}
            wasteGroups={wasteGroups}
            wasteCategories={wasteCategories}
            items={cartItems}
            onAddItem={handleAddCartItem}
            onRemoveItem={handleRemoveCartItem}
            title="Kabaad Entry"
          />

          {/* 3. Summary & Payment Method */}
          {cartItems.length > 0 && (
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Intake Summary
                  </span>
                  <div className="flex items-center gap-4 font-mono">
                    <div>
                      <span className="text-xs text-stone-500">Total Items: </span>
                      <span className="text-sm font-bold text-ink">{cartItems.length}</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-500">Total Scrap Weight: </span>
                      <span className="text-sm font-bold text-ink">{cartTotalWeight} kg</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs text-stone-500 block">Total Payable to Generator</span>
                  <span className="text-2xl font-bold text-emerald-800">
                    {formatCurrency(cartGrandTotal)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector & CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-ink">Payment Mode:</span>
                  <div className="flex rounded-xl bg-stone-100 p-1 font-mono text-xs font-bold border border-stone-200/60">
                    {['cash', 'upi', 'due'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMethod(mode)}
                        className={`rounded-lg px-3.5 py-1 uppercase transition ${
                          paymentMethod === mode
                            ? 'bg-white text-ink shadow-2xs font-bold'
                            : 'text-stone-500 hover:text-ink'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={!selectedGenerator}
                  className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-40 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <span>Confirm & Record Purchase →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Purchase Completed Receipt Card */
        <div className="max-w-xl mx-auto rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs text-center space-y-4 animate-fade-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold text-ink">
              Purchase Recorded Successfully
            </h2>
            <p className="font-mono text-xs text-stone-500 mt-0.5">
              Transaction ID: <span className="font-bold text-ink">{receipt.transaction?.id}</span>
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 text-xs font-mono space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-stone-500">Waste Generator</span>
              <span className="font-bold text-ink">{selectedGenerator?.name} ({selectedGenerator?.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Mode</span>
              <span className="font-bold uppercase text-ink">{receipt.transaction?.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Items Purchased</span>
              <span className="font-bold text-ink">{receipt.items?.length || 0} line items</span>
            </div>
            <div className="flex justify-between border-t border-stone-200/60 pt-2 text-sm">
              <span className="font-bold text-ink">Grand Total Paid</span>
              <span className="font-bold text-emerald-800">
                {formatCurrency(receipt.transaction?.grandTotal || 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
            >
              Start New Purchase
            </button>
            {onNavigateToTickets && (
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onNavigateToTickets();
                }}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-stone-100 transition"
              >
                View Tickets
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
