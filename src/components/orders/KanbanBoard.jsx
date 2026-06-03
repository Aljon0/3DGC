import Button from "@/components/ui/Button";
import { InlineSpinner } from "@/components/ui/Spinner";
import { useOrders } from "@/hooks/useOrders";
import { KANBAN_COLUMNS } from "@/store/useOrderStore";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard({ onAddWalkIn }) {
  const { ordersByStatus, isLoading, fetchOrders } = useOrders({ autoFetch: true });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-100">
            Order Board
          </h2>
          <p className="text-sm text-brand-400 font-sans mt-0.5">
            Manage all orders by status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Manual refresh — also auto-refreshes every 15s in background */}
          <Button
            variant="outline"
            size="sm"
            iconLeft={
              <RefreshCw
                className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            }
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="solid"
            size="sm"
            iconLeft={<Plus className="size-4" />}
            onClick={onAddWalkIn}
          >
            Walk-in Order
          </Button>
        </div>
      </div>

      {isLoading && !ordersByStatus ? (
        <InlineSpinner message="Loading orders..." />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4 flex-1 min-h-0">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              orders={ordersByStatus[col.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}