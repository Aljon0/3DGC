import { InlineSpinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * ChartWidget — wrapper for Recharts with consistent brand theming.
 * Types: bar, line, area
 *
 * @example
 * <ChartWidget
 *   type="bar"
 *   title="Monthly Revenue"
 *   data={revenueData}
 *   series={[{ key: 'revenue', label: 'Revenue', color: '#d8901f' }]}
 *   xKey="month"
 *   height={300}
 * />
 */

// ── Brand theme tokens for Recharts ───────────────────────────────────────
const THEME = {
  grid: "#2e3038", // brand-800
  axis: "#5c6170", // brand-500
  tooltip: {
    bg: "#1a1c21", // brand-900
    border: "#3b3f4b", // brand-700
    text: "#e2e3e6", // brand-100
  },
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-brand-900 border border-brand-700 rounded-xl
                      px-3 py-2.5 shadow-float text-sm font-sans"
    >
      <p className="text-brand-400 mb-1.5 text-xs font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-brand-300">{entry.name}:</span>
          <span className="font-semibold text-brand-100">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main ChartWidget ───────────────────────────────────────────────────────
export default function ChartWidget({
  type = "bar",
  title,
  subtitle,
  data = [],
  series = [], // [{ key, label, color }]
  xKey = "label",
  height = 280,
  loading = false,
  formatter, // (value, name) => string
  className,
  stacked = false,
}) {
  const sharedProps = {
    data,
    margin: { top: 4, right: 4, left: -8, bottom: 0 },
  };

  const axisProps = {
    tick: { fill: THEME.axis, fontSize: 11, fontFamily: "DM Sans" },
    axisLine: { stroke: THEME.grid },
    tickLine: false,
  };

  const renderChart = () => {
    // ── Bar Chart ──────────────────────────────────────
    if (type === "bar")
      return (
        <BarChart {...sharedProps}>
          <CartesianGrid
            vertical={false}
            stroke={THEME.grid}
            strokeDasharray="3 3"
          />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          {series.length > 1 && (
            <Legend
              formatter={(v) => (
                <span
                  style={{
                    color: THEME.axis,
                    fontSize: 11,
                    fontFamily: "DM Sans",
                  }}
                >
                  {v}
                </span>
              )}
            />
          )}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      );

    // ── Line Chart ─────────────────────────────────────
    if (type === "line")
      return (
        <LineChart {...sharedProps}>
          <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          {series.length > 1 && <Legend />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ fill: s.color, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      );

    // ── Area Chart ─────────────────────────────────────
    if (type === "area")
      return (
        <AreaChart {...sharedProps}>
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`grad-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          {series.length > 1 && <Legend />}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
            />
          ))}
        </AreaChart>
      );

    return null;
  };

  return (
    <div
      className={cn(
        "bg-brand-900 border border-brand-800 rounded-2xl p-5",
        className,
      )}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h3 className="font-display text-sm font-semibold text-brand-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-brand-500 font-sans mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Chart or loading */}
      {loading ? (
        <div style={{ height }}>
          <InlineSpinner />
        </div>
      ) : data.length === 0 ? (
        <div
          style={{ height }}
          className="flex items-center justify-center text-brand-500 text-sm font-sans"
        >
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      )}
    </div>
  );
}
