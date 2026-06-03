import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import OrderCard from "./OrderCard";

const COL_STYLES = {
  new: {
    accent: "border-t-blue-500",
    count: "bg-blue-500/10 text-blue-400",
  },
  awaiting_payment: {
    accent: "border-t-amber-400",
    count: "bg-amber-400/10 text-amber-300",
  },
  awaiting_2nd_payment: {
    accent: "border-t-orange-400",
    count: "bg-orange-400/10 text-orange-300",
  },
  processing: {
    accent: "border-t-amber-500",
    count: "bg-amber-500/10 text-amber-400",
  },
  finished: {
    accent: "border-t-emerald-500",
    count: "bg-emerald-500/10 text-emerald-400",
  },
  cancelled: {
    accent: "border-t-red-500",
    count: "bg-red-500/10 text-red-400",
  },
};

export default function KanbanColumn({ column, orders }) {
  const style = COL_STYLES[column.id] ?? COL_STYLES.new;

  return (
    <div
      className={cn(
        // Fixed width per column — scroll horizontally for 6 columns
        "shrink-0 w-64 xl:w-72",
        "flex flex-col rounded-2xl",
        "bg-brand-900 border border-brand-800 border-t-2",
        style.accent,
        "max-h-[calc(100vh-220px)]",
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5
                      border-b border-brand-800 shrink-0"
      >
        <h3 className="text-sm font-semibold font-sans text-brand-200">
          {column.label}
        </h3>
        <span
          className={cn(
            "text-xs font-medium font-mono px-2 py-0.5 rounded-full",
            style.count,
          )}
        >
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="size-6" />}
            title="No orders"
            size="sm"
          />
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
