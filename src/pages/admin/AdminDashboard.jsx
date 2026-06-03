import ChartWidget   from "@/components/shared/ChartWidget";
import StatCard      from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { InlineSpinner } from "@/components/ui/Spinner";
import { cn, formatPeso } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import api            from "@/services/api";
import { Clock, DollarSign, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { setPageTitle } = useUIStore();

  const [stats,         setStats]         = useState(null);
  const [monthlyData,   setMonthlyData]   = useState([]);
  const [recentOrders,  setRecentOrders]  = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());

  useEffect(() => { setPageTitle('Dashboard'); }, [setPageTitle]);

  // ── Fetch dashboard data ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [statsRes, revenueRes, ordersRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get(`/reports/monthly-revenue?year=${selectedYear}`),
          api.get('/orders?limit=6'),
        ]);

        setStats(statsRes.data.stats);
        setMonthlyData(revenueRes.data.months ?? []);
        setRecentOrders(ordersRes.data.orders ?? []);
      } catch (err) {
        console.error('[Dashboard] Load error:', err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedYear]);

  // ── Derived values from stats ─────────────────────────────────────────────
  const totalRevenue    = Number(stats?.total_revenue    ?? 0);
  const totalOrders     = Number(
    (stats?.new_orders ?? 0) +
    (stats?.processing_orders ?? 0) +
    (stats?.finished_orders ?? 0)
  );
  const pendingBalance  = Number(stats?.total_pending    ?? 0);
  const inProgress      = Number(stats?.processing_orders ?? 0);
  const newOrders       = Number(stats?.new_orders        ?? 0);
  const finished        = Number(stats?.finished_orders   ?? 0);

  // Cancelled not in dashboard_stats view — derive from recent orders
  // or just show 0 for now (reports page has full breakdown)
  const cancelled = 0;

  // ── Stone breakdown from monthly data ────────────────────────────────────
  // Backend doesn't aggregate by stone type in dashboard view.
  // We derive it from recent orders for the breakdown table.
  const stoneBreakdown = (() => {
    const map = {};
    recentOrders.forEach(o => {
      const type = o.stone_type ?? 'unknown';
      if (!map[type]) map[type] = { count: 0, revenue: 0 };
      map[type].count   += 1;
      map[type].revenue += Number(o.total_price ?? 0);
    });
    return Object.entries(map).map(([type, data]) => ({
      type:    type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      count:   data.count,
      revenue: data.revenue,
    }));
  })();

  const maxCount = Math.max(...stoneBreakdown.map(r => r.count), 1);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-50">
            Dashboard
          </h2>
          <p className="text-sm text-brand-400 font-sans mt-1">
            Overview of Double Seven operations.
          </p>
        </div>

        {/* Year selector for chart */}
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-brand-800 border border-brand-700 rounded-xl
                     px-3 py-2 text-sm text-brand-100 font-sans
                     focus:outline-none focus:border-accent-500"
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* ── KPI Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatPeso(totalRevenue, true)}
          icon={<DollarSign className="size-5" />}
          loading={isLoading}
          accent
        />
        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={<ShoppingBag className="size-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Pending Balance"
          value={formatPeso(pendingBalance, true)}
          icon={<Package className="size-5" />}
          loading={isLoading}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={<Clock className="size-5" />}
          loading={isLoading}
        />
      </div>

      {/* ── Order Status Breakdown ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New',        value: newOrders, color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
          { label: 'Processing', value: inProgress, color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
          { label: 'Finished',   value: finished,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Cancelled',  value: cancelled,  color: 'text-red-400',    bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
        ].map(s => (
          <div key={s.label} className={cn(
            'flex flex-col gap-1 p-4 rounded-2xl border',
            s.bg, s.border,
          )}>
            <span className={cn('text-2xl font-display font-bold', s.color)}>
              {isLoading ? '—' : s.value}
            </span>
            <span className="text-xs text-brand-400 font-sans">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue — area chart */}
        <div className="lg:col-span-2">
          <ChartWidget
            type="area"
            title="Monthly Revenue"
            subtitle={`Total revenue from finished orders — ${selectedYear}`}
            data={monthlyData}
            xKey="month"
            series={[{ key: 'revenue', label: 'Revenue', color: '#d8901f' }]}
            height={260}
            formatter={v => formatPeso(v, true)}
          />
        </div>

        {/* Orders per month — bar chart */}
        <ChartWidget
          type="bar"
          title="Orders per Month"
          subtitle={`Finished orders count — ${selectedYear}`}
          data={monthlyData}
          xKey="month"
          series={[{ key: 'order_count', label: 'Orders', color: '#5c6170' }]}
          height={260}
          formatter={v => `${v} orders`}
        />
      </div>

      {/* ── Stone Breakdown + Recent Orders ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Stone type breakdown from recent orders */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-800">
            <h3 className="text-sm font-display font-semibold text-brand-100">
              Orders by Stone Type
            </h3>
            <p className="text-xs text-brand-500 font-sans mt-0.5">
              Based on recent orders
            </p>
          </div>
          {isLoading ? (
            <div className="p-6"><InlineSpinner /></div>
          ) : stoneBreakdown.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-brand-500 font-sans">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-800">
              {stoneBreakdown.map((row, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-200 font-sans">
                      {row.type}
                    </p>
                    <p className="text-xs text-brand-500 font-sans">
                      {row.count} order{row.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-brand-100">
                      {formatPeso(row.revenue, true)}
                    </p>
                  </div>
                  <div className="w-16 h-1.5 bg-brand-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-full"
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-800">
            <h3 className="text-sm font-display font-semibold text-brand-100">
              Recent Orders
            </h3>
          </div>
          {isLoading ? (
            <div className="p-6"><InlineSpinner /></div>
          ) : recentOrders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-brand-500 font-sans">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-800">
              {recentOrders.map(o => (
                <div key={o.id}
                  className="flex items-center gap-3 px-5 py-3
                             hover:bg-brand-800/50 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-semibold text-accent-400">
                      {o.order_number}
                    </p>
                    <p className="text-xs text-brand-500 font-sans truncate">
                      {o.customer_name}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                  <p className="text-xs font-mono text-brand-200 shrink-0">
                    {formatPeso(o.total_price ?? 0, true)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}