import { useState, useMemo } from 'react';
import {
  Boxes,
  Truck,
  Scale,
  DollarSign,
  BarChart3,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Printer,
  Download,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Eye,
  Warehouse,
  Activity,
  X,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import InwardConsignmentModal from './InwardConsignmentModal';
import ProcessBatchModal from './ProcessBatchModal';
import CreateSaleDispatchModal from './CreateSaleDispatchModal';
import GatePassModal from './GatePassModal';

const CATEGORY_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'Paper', label: 'Paper' },
  { id: 'Plastic', label: 'Plastic' },
  { id: 'Metal', label: 'Metal' },
  { id: 'E-Waste', label: 'E-Waste' },
  { id: 'Glass', label: 'Glass' },
];

export default function MRFDashboardScreen({
  mrfData = {},
  setMrfData,
  onInwardAdd,
  onProcessBatchAdd,
  onSaleDispatchAdd,
}) {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'inward' | 'processing' | 'sales' | 'mis'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Bottom sheets state
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [viewTicketModal, setViewTicketModal] = useState({
    isOpen: false,
    data: null,
    type: 'sale',
  });

  const facility = mrfData?.facility || {
    id: 'MRF-PAT-01',
    name: 'Patna Central MRF',
    supervisor: 'Sunil Kumar',
    shift: 'Morning Shift (7:00 AM - 3:30 PM)',
    totalCapacityTons: 75.0,
    currentOccupancyTons: 38.5,
  };

  const stockList = mrfData?.stock || [];
  const inwardLogs = mrfData?.inwardLogs || [];
  const processingLogs = mrfData?.processingLogs || [];
  const salesLogs = mrfData?.salesLogs || [];

  // Summary calculations
  const totalStockKg = useMemo(
    () => stockList.reduce((sum, item) => sum + (Number(item.totalKg) || 0), 0),
    [stockList]
  );
  const totalStockTons = (totalStockKg / 1000).toFixed(1);
  const capacityPct = Math.min(
    100,
    Math.round(((Number(totalStockTons) / (facility.totalCapacityTons || 75)) * 100))
  );

  const totalStockValue = useMemo(
    () =>
      stockList.reduce(
        (sum, item) =>
          sum + (Number(item.baledProcessedKg || 0) * (item.marketSalePricePerKg || item.avgCostPerKg || 10)),
        0
      ),
    [stockList]
  );

  const totalInwardTodayKg = useMemo(
    () => inwardLogs.reduce((sum, log) => sum + (Number(log.acceptedNetKg) || 0), 0),
    [inwardLogs]
  );

  const totalSalesRevenue = useMemo(
    () => salesLogs.reduce((sum, sale) => sum + (Number(sale.totalAmount) || 0), 0),
    [salesLogs]
  );

  const totalSalesTons = useMemo(
    () => salesLogs.reduce((sum, sale) => sum + (Number(sale.quantityTons) || 0), 0),
    [salesLogs]
  );

  const totalResidueKg = useMemo(
    () => processingLogs.reduce((sum, log) => sum + (Number(log.residueKg) || 0), 0),
    [processingLogs]
  );

  const avgRecoveryRate = useMemo(() => {
    if (processingLogs.length === 0) return 94.5;
    const sum = processingLogs.reduce(
      (acc, log) => acc + (Number(log.recoveryEfficiencyPct) || 0),
      0
    );
    return (sum / processingLogs.length).toFixed(1);
  }, [processingLogs]);

  // Filtered lists
  const filteredStock = useMemo(() => {
    return stockList.filter((item) => {
      const matchCat =
        categoryFilter === 'all' ||
        item.category?.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchQuery =
        !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bayNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [stockList, categoryFilter, searchQuery]);

  const filteredInward = useMemo(() => {
    return inwardLogs.filter((log) => {
      const matchCat =
        categoryFilter === 'all' ||
        log.primaryCategory?.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchQuery =
        !searchQuery ||
        log.slipNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.sourceLocation?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [inwardLogs, categoryFilter, searchQuery]);

  const filteredProcessing = useMemo(() => {
    return processingLogs.filter((log) => {
      const matchCat =
        categoryFilter === 'all' ||
        log.inputCategory?.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchQuery =
        !searchQuery ||
        log.lineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.outputProduct?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.operator?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [processingLogs, categoryFilter, searchQuery]);

  const filteredSales = useMemo(() => {
    return salesLogs.filter((sale) => {
      const matchCat =
        categoryFilter === 'all' ||
        sale.category?.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchQuery =
        !searchQuery ||
        sale.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.gatePassNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.materialGrade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.truckNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [salesLogs, categoryFilter, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Item', 'Category', 'Bay', 'Unsorted (kg)', 'Baled (kg)', 'Total (kg)', 'Value (INR)'].join(','),
        ...stockList.map((i) =>
          [
            `"${i.name}"`,
            `"${i.category}"`,
            `"${i.bayNumber}"`,
            i.rawUnsortedKg,
            i.baledProcessedKg,
            i.totalKg,
            (i.baledProcessedKg * (i.marketSalePricePerKg || 10)).toFixed(2),
          ].join(',')
        ),
        [],
        ['Sales Ledger'],
        ['Invoice', 'Gate Pass', 'Buyer', 'Grade', 'Quantity (Tons)', 'Rate/Ton', 'Total (INR)', 'Status'].join(','),
        ...salesLogs.map((s) =>
          [
            s.invoiceNumber,
            s.gatePassNumber,
            `"${s.buyerName}"`,
            `"${s.materialGrade}"`,
            s.quantityTons,
            s.ratePerTon,
            s.totalAmount,
            `"${s.paymentStatus}"`,
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MRF_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-full pb-24 pt-0.5 text-slate-800 antialiased">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP HEADER */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-20 -mx-4 -mt-4 mb-3 border-b border-stone-200/80 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md sm:-mx-5 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <Warehouse size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-sm font-bold text-slate-900 truncate">
                  {facility.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                <span>{facility.supervisor}</span>
                <span className="mx-1.5 text-stone-300">•</span>
                <span>{facility.shift}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex h-8 items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 text-xs font-semibold text-slate-600 hover:bg-stone-100 active:scale-95 transition"
              title="Download CSV"
            >
              <Download size={13} />
              <span className="hidden sm:inline text-[11px]">Export</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-8 items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 text-xs font-semibold text-slate-600 hover:bg-stone-100 active:scale-95 transition"
              title="Print Summary"
            >
              <Printer size={13} />
              <span className="hidden sm:inline text-[11px]">Print</span>
            </button>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-2.5 rounded-xl border border-stone-200/60 bg-stone-50/70 p-2 text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-medium text-slate-600">Yard Capacity</span>
            <span className="font-mono font-semibold text-slate-800">
              {totalStockTons} / {facility.totalCapacityTons} Tons ({capacityPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200/70">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                capacityPct > 80 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. GLANCEABLE KPI HORIZON */}
      {/* ---------------------------------------------------- */}
      <section className="mb-3">
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-0.5 -mx-4 px-4 sm:-mx-5 sm:px-5">
          {/* KPI 1: Yard Stock */}
          <div className="flex min-w-[130px] sm:flex-1 flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Yard Stock</span>
            <p className="mt-1 font-mono text-base font-bold text-slate-900 leading-tight">
              {totalStockTons} <span className="text-xs font-normal text-slate-500">Tons</span>
            </p>
            <p className="text-[10px] text-emerald-800 font-mono font-semibold truncate mt-0.5">
              {formatCurrency(totalStockValue)}
            </p>
          </div>

          {/* KPI 2: Today Inward */}
          <div className="flex min-w-[130px] sm:flex-1 flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Today Inward</span>
            <p className="mt-1 font-mono text-base font-bold text-emerald-800 leading-tight">
              {(totalInwardTodayKg / 1000).toFixed(1)} <span className="text-xs font-normal text-emerald-700">Tons</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
              {inwardLogs.length} loads received
            </p>
          </div>

          {/* KPI 3: Sales */}
          <div className="flex min-w-[130px] sm:flex-1 flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Scrap Sold</span>
            <p className="mt-1 font-mono text-base font-bold text-slate-900 leading-tight">
              {formatCurrency(totalSalesRevenue)}
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
              {totalSalesTons.toFixed(1)} Tons sent
            </p>
          </div>

          {/* KPI 4: Recovery */}
          <div className="flex min-w-[130px] sm:flex-1 flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Recovery</span>
            <p className="mt-1 font-mono text-base font-bold text-emerald-800 leading-tight">
              {avgRecoveryRate}%
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
              {totalResidueKg} kg to RDF
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. SEARCH & CATEGORY FILTER PILLS */}
      {/* ---------------------------------------------------- */}
      <section className="mb-3 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-8 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none focus:border-emerald-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto no-scrollbar gap-1.5">
          {CATEGORY_PILLS.map((pill) => {
            const isSelected = categoryFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setCategoryFilter(pill.id)}
                className={`h-7 whitespace-nowrap rounded-lg px-2.5 text-[11px] font-semibold transition active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'border border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. MAIN CONTENT TABS */}
      {/* ---------------------------------------------------- */}

      {/* ==================================================== */}
      {/* TAB 1: YARD STOCK */}
      {/* ==================================================== */}
      {activeTab === 'stock' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-600">
              Yard Stock ({filteredStock.length} items)
            </h2>
            <button
              type="button"
              onClick={() => setShowProcessModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
            >
              <Plus size={13} />
              <span>Add Batch</span>
            </button>
          </div>

          <div className="space-y-2">
            {filteredStock.map((item) => {
              const totalKg = Number(item.totalKg) || 0;
              const rawKg = Number(item.rawUnsortedKg) || 0;
              const baledKg = Number(item.baledProcessedKg) || 0;
              const thresholdMax = Number(item.thresholdMaxKg) || 10000;
              const bayPct = Math.min(100, Math.round((totalKg / thresholdMax) * 100));
              const isHigh = totalKg >= thresholdMax * 0.85;

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-stone-200 bg-white p-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-mono font-semibold">{item.bayNumber}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-slate-900 mt-0.5">
                        {item.name}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      {(totalKg / 1000).toFixed(2)} Tons
                    </span>
                  </div>

                  {/* Stock Breakdown */}
                  <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-lg bg-stone-50 p-2 text-xs border border-stone-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Unsorted</span>
                      <span className="font-mono font-bold text-slate-800">
                        {rawKg.toLocaleString('en-IN')} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sorted / Baled</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {baledKg.toLocaleString('en-IN')} kg{' '}
                        {item.baleCount > 0 && `(${item.baleCount} bales)`}
                      </span>
                    </div>
                  </div>

                  {/* Rate & Value */}
                  <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                    <span className="text-slate-500 text-[11px]">
                      Rate: ₹{item.marketSalePricePerKg}/kg
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      Value: {formatCurrency(baledKg * (item.marketSalePricePerKg || 10))}
                    </span>
                  </div>

                  {/* Alert if near full */}
                  {isHigh && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-900 border border-amber-200">
                      <span>Bay is {bayPct}% full — Ready to sell</span>
                      <button
                        type="button"
                        onClick={() => setShowSaleModal(true)}
                        className="font-bold underline text-amber-900"
                      >
                        Create Sale →
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: INWARD */}
      {/* ==================================================== */}
      {activeTab === 'inward' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-600">
              Inward Loads ({filteredInward.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowInwardModal(true)}
              className="flex items-center gap-1 rounded-lg bg-emerald-800 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-900 transition active:scale-95"
            >
              <Plus size={13} />
              <span>Add Inward</span>
            </button>
          </div>

          <div className="space-y-2">
            {filteredInward.map((log) => (
              <article
                key={log.id}
                className="rounded-xl border border-stone-200 bg-white p-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {log.vehicleNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono bg-stone-100 px-1 rounded">
                        {log.slipNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {log.driverName} • {log.sourceLocation}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setViewTicketModal({ isOpen: true, data: log, type: 'inward' })
                    }
                    className="flex h-7 items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 transition active:scale-95"
                  >
                    <Eye size={12} />
                    <span>Slip</span>
                  </button>
                </div>

                {/* Weight numbers */}
                <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-stone-50 p-1.5 text-center text-xs border border-stone-100">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Gross</span>
                    <span className="font-mono font-bold text-slate-800">{log.grossWeightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Tare</span>
                    <span className="font-mono font-bold text-slate-800">{log.tareWeightKg} kg</span>
                  </div>
                  <div className="bg-emerald-100/70 rounded py-0.5">
                    <span className="text-[9px] text-emerald-900 block uppercase font-bold">Net</span>
                    <span className="font-mono font-bold text-emerald-900">{log.acceptedNetKg} kg</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{log.primaryCategory}</span>
                  <span className="font-mono">{formatDateTime(log.timestamp)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: SORTING */}
      {/* ==================================================== */}
      {activeTab === 'processing' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-600">
              Sorting Batches ({filteredProcessing.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowProcessModal(true)}
              className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition active:scale-95"
            >
              <Plus size={13} />
              <span>Add Batch</span>
            </button>
          </div>

          <div className="space-y-2">
            {filteredProcessing.map((batch) => (
              <article
                key={batch.id}
                className="rounded-xl border border-stone-200 bg-white p-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">{batch.lineName}</span>
                    <h3 className="font-heading text-sm font-bold text-slate-900 mt-0.5">
                      {batch.outputProduct}
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                    {batch.recoveryEfficiencyPct}% Yield
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-stone-50 p-1.5 text-center text-xs border border-stone-100">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Input</span>
                    <span className="font-mono font-bold text-slate-800">{batch.inputRawKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-800 block uppercase font-bold">Output</span>
                    <span className="font-mono font-bold text-emerald-900">{batch.outputProcessedKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Residue</span>
                    <span className="font-mono font-semibold text-slate-600">{batch.residueKg} kg</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    Operator: <strong>{batch.operator}</strong>{' '}
                    {batch.baleCount > 0 && `(${batch.baleCount} bales)`}
                  </span>
                  <span className="font-mono">{formatDateTime(batch.timestamp)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: SALES */}
      {/* ==================================================== */}
      {activeTab === 'sales' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-600">
              Scrap Sales ({filteredSales.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowSaleModal(true)}
              className="flex items-center gap-1 rounded-lg bg-emerald-800 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-900 transition active:scale-95"
            >
              <Plus size={13} />
              <span>New Sale</span>
            </button>
          </div>

          <div className="space-y-2">
            {filteredSales.map((sale) => (
              <article
                key={sale.id}
                className="rounded-xl border border-stone-200 bg-white p-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-slate-900">
                      {sale.buyerName}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {sale.gatePassNumber} • {sale.buyerLocation}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setViewTicketModal({ isOpen: true, data: sale, type: 'sale' })
                    }
                    className="flex h-7 items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 transition active:scale-95"
                  >
                    <FileText size={12} />
                    <span>Pass</span>
                  </button>
                </div>

                <div className="mt-2 rounded-lg bg-stone-50 p-2 text-xs space-y-1 border border-stone-100">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Grade:</span>
                    <span className="font-semibold text-slate-900">{sale.materialGrade}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Quantity:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {sale.quantityTons} Tons @ {formatCurrency(sale.ratePerTon)}/Ton
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-stone-200/60 pt-1">
                    <span className="font-bold text-slate-800">Total:</span>
                    <span className="font-mono font-extrabold text-emerald-800 text-sm">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Truck: <strong className="font-mono text-slate-700">{sale.truckNumber}</strong></span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {sale.paymentStatus}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: MIS */}
      {/* ==================================================== */}
      {activeTab === 'mis' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
            <h2 className="font-heading text-xs font-bold text-slate-800 border-b border-stone-100 pb-1.5">
              Material Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 mb-0.5">
                  <span className="font-medium">Paper & Cardboard</span>
                  <span className="font-mono font-bold">11.7 Tons (94% yield)</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-0.5">
                  <span className="font-medium">Plastics</span>
                  <span className="font-mono font-bold">11.5 Tons (92% yield)</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-0.5">
                  <span className="font-medium">Metals</span>
                  <span className="font-mono font-bold">8.7 Tons (97% yield)</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-0.5">
                  <span className="font-medium">Glass & E-Waste</span>
                  <span className="font-mono font-bold">3.5 Tons (98% yield)</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs space-y-1">
              <h3 className="font-bold text-slate-800">🌱 Landfill Saved</h3>
              <p className="text-slate-600">
                <strong className="text-emerald-800 font-mono">38.5 Tons</strong> waste diverted from city landfill this month.
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Approx. <strong>64 Tons CO₂</strong> emissions reduced.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs space-y-1">
              <h3 className="font-bold text-slate-800">🚚 Mill Offtake</h3>
              <p className="text-slate-600">
                Supplying scrap to <strong className="text-slate-800 font-semibold">7 recycling mills</strong> in Bihar & UP.
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Average dispatch turnaround: <strong>48 hours</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. STICKY BOTTOM NAVIGATION RAIL */}
      {/* ---------------------------------------------------- */}
      <nav
        aria-label="MRF Dashboard Navigation"
        className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[460px] justify-center px-3 pb-3 pt-1"
      >
        <div className="flex w-full items-center justify-between gap-1 rounded-2xl border border-stone-200/90 bg-white/95 p-1 shadow-floating backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`flex min-h-[42px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition active:scale-95 ${
              activeTab === 'stock'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Boxes size={15} className={activeTab === 'stock' ? 'text-amber-400' : ''} />
            <span className="mt-0.5">Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inward')}
            className={`flex min-h-[42px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition active:scale-95 ${
              activeTab === 'inward'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scale size={15} className={activeTab === 'inward' ? 'text-emerald-400' : ''} />
            <span className="mt-0.5">Inward ({inwardLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('processing')}
            className={`flex min-h-[42px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition active:scale-95 ${
              activeTab === 'processing'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers size={15} className={activeTab === 'processing' ? 'text-sky-400' : ''} />
            <span className="mt-0.5">Sorting ({processingLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`flex min-h-[42px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition active:scale-95 ${
              activeTab === 'sales'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign size={15} className={activeTab === 'sales' ? 'text-emerald-400' : ''} />
            <span className="mt-0.5">Sales ({salesLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mis')}
            className={`flex min-h-[42px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-[10px] font-bold transition active:scale-95 ${
              activeTab === 'mis'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 size={15} className={activeTab === 'mis' ? 'text-indigo-400' : ''} />
            <span className="mt-0.5">MIS</span>
          </button>
        </div>
      </nav>

      {/* ==================================================== */}
      {/* 6. BOTTOM SHEETS */}
      {/* ==================================================== */}
      <InwardConsignmentModal
        isOpen={showInwardModal}
        onClose={() => setShowInwardModal(false)}
        onSave={(newInward) => {
          if (onInwardAdd) {
            onInwardAdd(newInward);
          }
          setViewTicketModal({ isOpen: true, data: newInward, type: 'inward' });
        }}
        masterItems={stockList}
      />

      <ProcessBatchModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onSave={(newBatch) => {
          if (onProcessBatchAdd) {
            onProcessBatchAdd(newBatch);
          }
        }}
        stock={stockList}
      />

      <CreateSaleDispatchModal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        onSave={(newSale) => {
          if (onSaleDispatchAdd) {
            onSaleDispatchAdd(newSale);
          }
          setViewTicketModal({ isOpen: true, data: newSale, type: 'sale' });
        }}
        stock={stockList}
      />

      <GatePassModal
        isOpen={viewTicketModal.isOpen}
        onClose={() => setViewTicketModal({ isOpen: false, data: null, type: 'sale' })}
        data={viewTicketModal.data}
        type={viewTicketModal.type}
      />
    </div>
  );
}
