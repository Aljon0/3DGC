import OrderDetailSlideOver from "@/components/orders/OrderDetailSlideOver";
import ConfirmDialog        from "@/components/shared/ConfirmDialog";
import { StatusBadge }      from "@/components/ui/Badge";
import Button               from "@/components/ui/Button";
import { SelectDropdown }   from "@/components/ui/Dropdown";
import EmptyState           from "@/components/ui/EmptyState";
import Input                from "@/components/ui/Input";
import { InlineSpinner }    from "@/components/ui/Spinner";
import { useOrders }        from "@/hooks/useOrders";
import { cn, formatDate, formatPeso } from "@/lib/utils";
import { useUIStore }       from "@/store/useUIStore";
import { Eye, Package, Search, ShoppingBag, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_FILTERS = [
  { value: 'all',                  label: 'All Orders'       },
  { value: 'new',                  label: 'New'              },
  { value: 'awaiting_payment',     label: 'Awaiting Payment' },
  { value: 'awaiting_2nd_payment', label: '2nd Payment'      },
  { value: 'processing',           label: 'Processing'       },
  { value: 'finished',             label: 'Finished'         },
  { value: 'cancelled',            label: 'Cancelled'        },
];

export default function CustomerOrdersPage() {
  const { setPageTitle, openSlideOver } = useUIStore();
  const {
    filteredOrders,
    isLoading,
    filters,
    setFilter,
    setActiveOrder,
    cancelOrder,
  } = useOrders({ autoFetch: true });

  const [cancelTarget,  setCancelTarget]  = useState(null);
  const [cancelReason,  setCancelReason]  = useState('');
  const [isCancelling,  setIsCancelling]  = useState(false);

  useEffect(() => { setPageTitle('My Orders'); }, [setPageTitle]);

  const handleCancel = async () => {
    setIsCancelling(true);
    await cancelOrder(
      cancelTarget.id,
      cancelReason.trim() || 'Customer requested cancellation.'
    );
    setIsCancelling(false);
    setCancelTarget(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-50">My Orders</h2>
        <p className="text-sm text-brand-400 font-sans mt-1">
          Track and manage your monument orders.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-50 max-w-xs">
          <Input
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search orders..."
            iconLeft={<Search className="size-4" />}
            size="sm"
          />
        </div>
        <SelectDropdown
          value={filters.status}
          onChange={v => setFilter('status', v)}
          options={STATUS_FILTERS}
          size="sm"
          className="w-44"
        />
      </div>

      {/* Orders list */}
      {isLoading ? (
        <InlineSpinner />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-7" />}
          title="No orders found"
          description={
            filters.status !== 'all' || filters.search
              ? 'Try adjusting your filters.'
              : 'Place your first order from the customizer.'
          }
          size="md"
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              onView={() => {
                setActiveOrder(order.id);
                openSlideOver('order-detail');
              }}
              onCancel={() => setCancelTarget(order)}
            />
          ))}
        </div>
      )}

      <OrderDetailSlideOver role="customer" />

      {/* Cancel confirm */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => { setCancelTarget(null); setCancelReason(''); }}
        onConfirm={handleCancel}
        loading={isCancelling}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This may be subject to our cancellation policy."
        confirmLabel="Yes, Cancel"
        variant="danger"
      />
    </div>
  );
}

// ── OrderRow ───────────────────────────────────────────────────────────────
function OrderRow({ order, onView, onCancel }) {
  // Normalize snake_case from DB with camelCase fallbacks
  const orderNumber  = order.order_number  ?? order.orderNumber  ?? '—';
  const stoneType    = order.stone_type    ?? order.stoneType    ?? '—';
  const texture      = order.texture       ?? null;
  const dimensions   = order.dimensions    ?? null;
  const selectedSize = order.selected_size ?? order.selectedSize ?? null;
  const snapshotUrl  = order.snapshot_url  ?? order.snapshot     ?? null;
  const isWalkIn     = order.is_walk_in    ?? order.isWalkIn     ?? false;
  const totalPrice   = Number(order.total_price  ?? order.totalPrice  ?? 0);
  const amountPaid   = Number(order.amount_paid  ?? order.amountPaid  ?? 0);
  const createdAt    = order.created_at    ?? order.createdAt    ?? null;

  const paidPct = totalPrice > 0
    ? Math.round((amountPaid / totalPrice) * 100)
    : 0;

  // Size display
  const sizeDisplay = selectedSize
    ? selectedSize.replace('x', ' × ')
    : dimensions?.width
      ? `${dimensions.width}×${dimensions.height} cm`
      : null;

  // Status-based notice for customer
  const statusNotice = {
    new:                  { text: 'Awaiting admin approval',        color: 'text-blue-400'   },
    awaiting_payment:     { text: 'Accepted — please upload payment', color: 'text-amber-400' },
    awaiting_2nd_payment: { text: 'Please upload 2nd payment',       color: 'text-amber-400' },
    processing:           { text: 'Your order is being processed',   color: 'text-emerald-400'},
    finished:             { text: 'Order completed',                 color: 'text-emerald-400'},
    cancelled:            { text: 'Order cancelled',                 color: 'text-red-400'    },
  }[order.status];

  // Customer can only cancel when new or awaiting_payment
  const canCancel = ['new', 'awaiting_payment', 'processing'].includes(order.status);

  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center gap-4',
      'p-4 rounded-2xl bg-brand-900 border border-brand-800',
      'hover:border-brand-600 transition-all duration-150',
    )}>
      {/* Snapshot */}
      <div className="shrink-0">
        {snapshotUrl ? (
          <img
            src={snapshotUrl}
            alt="Design"
            className="size-16 rounded-xl object-cover border border-brand-700"
          />
        ) : (
          <div className="size-16 rounded-xl bg-brand-800 border border-brand-700
                          flex items-center justify-center">
            <Package className="size-7 text-brand-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-mono font-bold text-accent-400">
            {orderNumber}
          </span>
          <StatusBadge status={order.status} />
          {isWalkIn && (
            <span className="text-xs text-brand-500 font-sans">Walk-in</span>
          )}
        </div>

        <p className="text-xs text-brand-500 font-sans capitalize">
          {stoneType}
          {texture && !texture.startsWith('http') ? ` · ${texture}` : ''}
          {sizeDisplay ? ` · ${sizeDisplay}` : ''}
        </p>

        {/* Status notice */}
        {statusNotice && (
          <p className={cn('text-xs font-sans font-medium', statusNotice.color)}>
            {statusNotice.text}
          </p>
        )}

        {/* Payment progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-brand-700 rounded-full overflow-hidden max-w-30">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                paidPct >= 100 ? 'bg-emerald-400' : 'bg-accent-500',
              )}
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <span className="text-xs text-brand-500 font-sans">
            {formatPeso(amountPaid)} / {formatPeso(totalPrice)}
          </span>
        </div>
      </div>

      {/* Date + Actions */}
      <div className="flex sm:flex-col items-center sm:items-end
                      justify-between gap-3 shrink-0">
        <p className="text-xs text-brand-500 font-sans">
          {formatDate(createdAt)}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"
            iconLeft={<Eye className="size-3.5" />}
            onClick={onView}>
            View
          </Button>
          {canCancel && (
            <Button variant="danger" size="sm"
              iconLeft={<XCircle className="size-3.5" />}
              onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}