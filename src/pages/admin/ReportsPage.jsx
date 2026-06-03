import ChartWidget   from "@/components/shared/ChartWidget";
import DataTable     from "@/components/shared/DataTable";
import StatCard      from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import Button        from "@/components/ui/Button";
import { SelectDropdown } from "@/components/ui/Dropdown";
import Input         from "@/components/ui/Input";
import { cn, formatDate, formatPeso } from "@/lib/utils";
import api           from "@/services/api";
import { useUIStore } from "@/store/useUIStore";
import { DollarSign, Download, FileSpreadsheet, FileText, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const { setPageTitle } = useUIStore();

  const [transactions,   setTransactions]   = useState([]);
  const [summary,        setSummary]        = useState(null);
  const [monthlyData,    setMonthlyData]    = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingXLS, setIsExportingXLS] = useState(false);

  const [statusFilter, setStatusFilter] = useState('finished');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { setPageTitle('Reports'); }, [setPageTitle]);

  // ── Load transactions + summary ──────────────────────────────────────────
  const loadReportRef = useRef(async (status, from, to) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ status: status || 'finished', limit: 100 });
      if (from) params.set('startDate', from);
      if (to)   params.set('endDate', to);

      const [txRes, summaryRes] = await Promise.all([
        api.get(`/reports/transactions?${params}`),
        api.get(`/reports/summary?${from ? `startDate=${from}` : ''}${to ? `&endDate=${to}` : ''}`),
      ]);

      setTransactions(txRes.data.transactions ?? []);
      setSummary(summaryRes.data.summary ?? null);
    } catch (err) {
      console.error('[Reports] Load error:', err);
      toast.error('Failed to load report data.');
    } finally {
      setIsLoading(false);
    }
  });

  // ── Load monthly chart data ──────────────────────────────────────────────
  const loadChartRef = useRef(async (year) => {
    setIsChartLoading(true);
    try {
      const response = await api.get(`/reports/monthly-revenue?year=${year}`);
      setMonthlyData(response.data.months ?? []);
    } catch (err) {
      console.error('[Reports] Chart error:', err);
    } finally {
      setIsChartLoading(false);
    }
  });

  useEffect(() => {
    loadReportRef.current('finished', '', '');
    loadChartRef.current(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    loadChartRef.current(selectedYear);
  }, [selectedYear]);

  const handleApplyFilters = () => loadReportRef.current(statusFilter, dateFrom, dateTo);

  const handleReset = () => {
    setStatusFilter('finished');
    setDateFrom('');
    setDateTo('');
    loadReportRef.current('finished', '', '');
  };

  // ── Summary values ───────────────────────────────────────────────────────
  const totalIncome    = Number(summary?.totalRevenue     ?? 0);
  const totalCollected = Number(summary?.totalCollected   ?? 0);
  const pendingBalance = Number(summary?.pendingBalance   ?? 0);
  const totalOrders    = Number(summary?.transactionCount ?? transactions.length);

  // ── Export Excel (raw transaction data) ─────────────────────────────────
  const generateExcel = async () => {
    setIsExportingXLS(true);
    try {
      const XLSX = await import('xlsx');

      const rows = transactions.map(o => ({
        'Order #':       o.order_number   ?? '—',
        'Customer':      o.customer_name  ?? '—',
        'Stone Type':    o.stone_type     ?? '—',
        'Texture':       o.texture        ?? '—',
        'Total Price':   Number(o.total_price  ?? 0),
        'Amount Paid':   Number(o.amount_paid  ?? 0),
        'Balance':       Number(o.balance      ?? 0),
        'Status':        o.status         ?? '—',
        'Date':          formatDate(o.date ?? o.created_at),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Column widths
      ws['!cols'] = [
        { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 12 },
        { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Optional: add a summary sheet
      const summaryRows = [
        { 'Metric': 'Total Income',    'Value': totalIncome    },
        { 'Metric': 'Total Collected', 'Value': totalCollected },
        { 'Metric': 'Pending Balance', 'Value': pendingBalance },
        { 'Metric': 'Total Orders',    'Value': totalOrders    },
        { 'Metric': 'Filter Status',   'Value': statusFilter   },
        { 'Metric': 'Date From',       'Value': dateFrom || 'All' },
        { 'Metric': 'Date To',         'Value': dateTo   || 'All' },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 18 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      XLSX.writeFile(wb, `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Excel file downloaded.');
    } catch (err) {
      toast.error('Excel export failed.');
      console.error(err);
    } finally {
      setIsExportingXLS(false);
    }
  };

  // ── Export PDF (summarized, client-ready) ────────────────────────────────
  const generatePDF = async () => {
    setIsExportingPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const accentColor  = [216, 144, 31];   // amber
      const mutedColor   = [140, 140, 140];
      const darkColor    = [30,  30,  30];
      const lightBg      = [250, 248, 244];

      // ── Header bar ──────────────────────────────────────────────────────
      doc.setFillColor(...accentColor);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Double Seven', 14, 13);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Financial Summary Report', 14, 21);

      // Date + filter info (top-right)
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}`, 196, 10, { align: 'right' });
      doc.text(
        `Period: ${dateFrom || 'All time'} ${dateTo ? `→ ${dateTo}` : ''}`,
        196, 16, { align: 'right' },
      );
      doc.text(`Status filter: ${statusFilter}`, 196, 22, { align: 'right' });

      let y = 40;

      // ── Summary cards (3 boxes) ──────────────────────────────────────────
      const cards = [
        { label: 'Total Income',    value: formatPeso(totalIncome),    note: 'All finished orders' },
        { label: 'Total Collected', value: formatPeso(totalCollected), note: 'Payments received'    },
        { label: 'Pending Balance', value: formatPeso(pendingBalance), note: 'Outstanding amount'   },
      ];

      cards.forEach((card, i) => {
        const x = 14 + i * 62;
        doc.setFillColor(...lightBg);
        doc.roundedRect(x, y, 58, 22, 3, 3, 'F');
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, 58, 22, 3, 3, 'S');

        doc.setFontSize(7);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'normal');
        doc.text(card.label.toUpperCase(), x + 4, y + 6);

        doc.setFontSize(11);
        doc.setTextColor(...darkColor);
        doc.setFont('helvetica', 'bold');
        doc.text(card.value, x + 4, y + 14);

        doc.setFontSize(7);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'normal');
        doc.text(card.note, x + 4, y + 19.5);
      });

      y += 32;

      // Total transactions badge
      doc.setFillColor(...accentColor);
      doc.roundedRect(14, y, 40, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${totalOrders} Transactions`, 34, y + 6.5, { align: 'center' });

      y += 18;

      // ── Monthly Revenue Table ────────────────────────────────────────────
      if (monthlyData.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(...darkColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`Monthly Revenue — ${selectedYear}`, 14, y);
        y += 2;

        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.8);
        doc.line(14, y, 120, y);
        y += 6;

        // Table header
        doc.setFillColor(...accentColor);
        doc.rect(14, y, 106, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Month',     18,  y + 5.5);
        doc.text('Revenue',   62,  y + 5.5, { align: 'right' });
        doc.text('Collected', 92,  y + 5.5, { align: 'right' });
        doc.text('Variance',  118, y + 5.5, { align: 'right' });
        y += 8;

        monthlyData.forEach((m, idx) => {
          const rev  = Number(m.revenue   ?? 0);
          const col  = Number(m.collected ?? 0);
          const diff = rev - col;

          if (idx % 2 === 0) {
            doc.setFillColor(245, 242, 236);
            doc.rect(14, y, 106, 7, 'F');
          }

          doc.setTextColor(...darkColor);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(m.month ?? `Month ${idx + 1}`, 18, y + 5);
          doc.text(formatPeso(rev),  62,  y + 5, { align: 'right' });
          doc.text(formatPeso(col),  92,  y + 5, { align: 'right' });

          doc.setTextColor(diff > 0 ? 200 : 0, diff > 0 ? 80 : 160, diff > 0 ? 0 : 80);
          doc.text(formatPeso(Math.abs(diff)), 118, y + 5, { align: 'right' });

          y += 7;
          if (y > 265) { doc.addPage(); y = 20; }
        });

        y += 8;
      }

      // ── Top transactions (condensed, not full raw data) ──────────────────
      const topTx = [...transactions]
        .sort((a, b) => Number(b.total_price ?? 0) - Number(a.total_price ?? 0))
        .slice(0, 10);

      if (topTx.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(...darkColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Transactions', 14, y);
        y += 2;
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.8);
        doc.line(14, y, 120, y);
        y += 6;

        doc.setFillColor(...accentColor);
        doc.rect(14, y, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Order #',   18,  y + 5.5);
        doc.text('Customer',  55,  y + 5.5);
        doc.text('Product',   105, y + 5.5);
        doc.text('Total',     145, y + 5.5, { align: 'right' });
        doc.text('Status',    196, y + 5.5, { align: 'right' });
        y += 8;

        topTx.forEach((o, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(245, 242, 236);
            doc.rect(14, y, 182, 7, 'F');
          }
          doc.setTextColor(...darkColor);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(o.order_number   ?? '—',                   18,  y + 5);
          doc.text((o.customer_name ?? '—').slice(0, 20),     55,  y + 5);
          doc.text((o.stone_type    ?? '—').slice(0, 14),     105, y + 5);
          doc.text(formatPeso(Number(o.total_price ?? 0)),    145, y + 5, { align: 'right' });
          doc.text(o.status         ?? '—',                   196, y + 5, { align: 'right' });
          y += 7;
        });
      }

      // ── Footer ───────────────────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(245, 242, 236);
        doc.rect(0, 284, 210, 13, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'normal');
        doc.text('Double Seven — Confidential', 14, 291);
        doc.text(`Page ${i} of ${pageCount}`, 196, 291, { align: 'right' });
      }

      doc.save(`summary_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('PDF report downloaded.');
    } catch (err) {
      toast.error('PDF generation failed.');
      console.error(err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'order_number', label: 'Order #', sortable: true,
      render: v => <span className="text-xs font-mono font-bold text-accent-400">{v}</span>,
    },
    {
      key: 'customer_name', label: 'Customer', sortable: true,
      render: v => <span className="text-sm font-sans text-brand-200">{v}</span>,
    },
    {
      key: 'stone_type', label: 'Product', muted: true,
      render: (v, row) => (
        <span className="text-xs font-sans text-brand-400 capitalize">
          {v ?? '—'}{row.texture ? ` · ${row.texture}` : ''}
        </span>
      ),
    },
    {
      key: 'total_price', label: 'Total', sortable: true,
      render: v => (
        <span className="text-sm font-mono font-semibold text-brand-100">
          {formatPeso(Number(v ?? 0))}
        </span>
      ),
    },
    {
      key: 'amount_paid', label: 'Paid', sortable: true,
      render: v => (
        <span className="text-sm font-mono text-emerald-400">
          {formatPeso(Number(v ?? 0))}
        </span>
      ),
    },
    {
      key: 'balance', label: 'Balance', sortable: true,
      render: v => (
        <span className={cn('text-sm font-mono', Number(v) > 0 ? 'text-amber-400' : 'text-brand-500')}>
          {formatPeso(Number(v ?? 0))}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: v => <StatusBadge status={v} />,
    },
    {
      key: 'date', label: 'Date', sortable: true, muted: true,
      render: (v, row) => (
        <span className="text-xs font-sans text-brand-400">
          {formatDate(row.date ?? row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-50">Reports</h2>
          <p className="text-sm text-brand-400 font-sans mt-1">
            Financial overview and transaction history.
          </p>
        </div>

        {/* ── Export buttons ── */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="md"
            iconLeft={<FileSpreadsheet className="size-4" />}
            onClick={generateExcel}
            disabled={transactions.length === 0 || isExportingXLS}
            title="Export raw transaction data as Excel"
          >
            {isExportingXLS ? 'Exporting…' : 'Export Excel'}
          </Button>
          <Button
            variant="solid"
            size="md"
            iconLeft={<Download className="size-4" />}
            onClick={generatePDF}
            disabled={transactions.length === 0 || isExportingPDF}
            title="Export summarized client-ready PDF report"
          >
            {isExportingPDF ? 'Generating…' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Income"    value={formatPeso(totalIncome, true)}    icon={<DollarSign className="size-5" />} accent loading={isLoading} />
        <StatCard label="Pending Balance" value={formatPeso(pendingBalance, true)} icon={<Package   className="size-5" />}       loading={isLoading} />
        <StatCard label="Transactions"    value={totalOrders}                      icon={<FileText  className="size-5" />}       loading={isLoading} />
      </div>

      {/* Monthly Revenue Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div />
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-brand-800 border border-brand-700 rounded-xl
                       px-3 py-1.5 text-sm text-brand-100 font-sans
                       focus:outline-none focus:border-accent-500"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <ChartWidget
          type="bar"
          title="Monthly Revenue"
          subtitle={`Income from finished orders — ${selectedYear}`}
          data={isChartLoading ? [] : monthlyData}
          xKey="month"
          series={[
            { key: 'revenue',   label: 'Revenue',   color: '#d8901f' },
            { key: 'collected', label: 'Collected', color: '#4a9d6f' },
          ]}
          height={260}
          formatter={v => formatPeso(v, true)}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SelectDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all',       label: 'All Statuses' },
            { value: 'finished',  label: 'Finished'     },
            { value: 'cancelled', label: 'Cancelled'    },
          ]}
          size="sm"
          className="w-40"
        />
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} size="sm" className="w-40" />
        <span className="text-brand-500 text-sm font-sans">to</span>
        <Input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   size="sm" className="w-40" />
        <Button variant="solid" size="sm" onClick={handleApplyFilters}>Apply</Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>Reset</Button>
      </div>

      {/* Transaction table */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={isLoading}
        searchable
        searchPlaceholder="Search transactions..."
        emptyTitle="No transactions found"
        emptyIcon={<FileText className="size-7" />}
        defaultPageSize={15}
      />
    </div>
  );
}