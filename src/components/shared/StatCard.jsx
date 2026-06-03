import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

/**
 * StatCard — KPI metric card for dashboards.
 * Shows value, label, trend, and optional icon.
 *
 * @example
 * <StatCard
 *   label="Total Revenue"
 *   value="₱142,500"
 *   trend={{ value: 12.4, label: 'vs last month' }}
 *   icon={<DollarSign />}
 *   accent
 * />
 */
export default function StatCard({
  label,
  value,
  trend, // { value: number (%), label: string, direction?: 'up'|'down'|'flat' }
  icon,
  accent = false,
  loading = false,
  className,
  onClick,
}) {
  // Auto-detect direction if not explicit
  const direction =
    trend?.direction ??
    (trend?.value > 0 ? "up" : trend?.value < 0 ? "down" : "flat");

  const trendConfig = {
    up: {
      icon: <TrendingUp className="size-3" />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    down: {
      icon: <TrendingDown className="size-3" />,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    flat: {
      icon: <Minus className="size-3" />,
      color: "text-brand-400",
      bg: "bg-brand-700",
    },
  };

  const tc = trendConfig[direction] ?? trendConfig.flat;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-4 p-5 rounded-2xl",
        "bg-brand-900 border border-brand-800",
        "transition-all duration-200",
        onClick && "cursor-pointer hover:border-brand-600 hover:shadow-panel",
        accent &&
          "border-accent-500/20 bg-lineart-to-br from-brand-900 to-accent-950/20",
        className,
      )}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between gap-4">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center shrink-0",
              accent
                ? "bg-accent-500/20 text-accent-400 border border-accent-500/30"
                : "bg-brand-800 text-brand-400 border border-brand-700",
            )}
          >
            <span className="size-5">{icon}</span>
          </div>
        )}

        {/* Trend badge */}
        {trend && !loading && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full",
              "text-xs font-medium font-sans ml-auto",
              tc.color,
              tc.bg,
            )}
          >
            {tc.icon}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value + Label */}
      <div className="space-y-1">
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-32 rounded-lg bg-brand-800 animate-pulse" />
            <div className="h-4 w-24 rounded-lg bg-brand-800 animate-pulse" />
          </div>
        ) : (
          <>
            <p
              className={cn(
                "font-display text-2xl md:text-3xl font-bold leading-none",
                accent ? "text-accent-300" : "text-brand-50",
              )}
            >
              {value}
            </p>
            <p className="text-sm text-brand-400 font-sans">{label}</p>
          </>
        )}
      </div>

      {/* Trend label */}
      {trend?.label && !loading && (
        <p className={cn("text-xs font-sans", tc.color)}>
          {tc.icon && (
            <span className="inline-flex items-center gap-1">
              {trend.label}
            </span>
          )}
        </p>
      )}

      {/* Accent glow effect */}
      {accent && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none
                        bg-linear-to-br from-accent-500/5 to-transparent"
        />
      )}
    </div>
  );
}
