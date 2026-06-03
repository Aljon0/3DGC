import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/ui/Badge";
import Dropdown from "@/components/ui/Dropdown";
import Input from "@/components/ui/Input";
import { useOrders } from "@/hooks/useOrders";
import { cn, formatDate, formatPeso, timeAgo } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  MoreHorizontal,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function OrderCard({ order }) {
  const { changeStatus, setActiveOrder } = useOrders();
  const { openSlideOver } = useUIStore();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isActing, setIsActing] = useState(false);

  // ── Normalize snake_case fields from DB ──────────────────────────────
  const orderNumber = order.order_number ?? order.orderNumber ?? "—";
  const customerName = order.customer_name ?? order.customerName ?? "—";
  const stoneType = order.stone_type ?? order.stoneType ?? "—";
  const texture = order.texture ?? null;
  const totalPrice = Number(order.total_price ?? order.totalPrice ?? 0);
  const amountPaid = Number(order.amount_paid ?? order.amountPaid ?? 0);
  const paymentType = order.payment_type ?? order.paymentType ?? null;
  const isWalkIn = order.is_walk_in ?? order.isWalkIn ?? false;
  const createdAt = order.created_at ?? order.createdAt ?? null;

  // ── Payment progress ─────────────────────────────────────────────────
  const paidPct =
    totalPrice > 0 ? Math.round((amountPaid / totalPrice) * 100) : 0;

  // ── Quick actions per status ─────────────────────────────────────────
  const getActions = () => {
    const actions = [
      {
        label: "View Details",
        icon: <Eye className="size-4" />,
        onClick: () => {
          setActiveOrder(order.id);
          openSlideOver("order-detail");
        },
      },
    ];

    if (order.status === "new") {
      actions.push(
        { divider: true },
        {
          label: "Accept Order",
          icon: <CheckCircle className="size-4" />,
          onClick: () => {
            // Accept → awaiting_payment (customer must pay before processing)
            setConfirmAction({ type: "accept", status: "awaiting_payment" });
            setConfirmOpen(true);
          },
        },
        {
          label: "Reject Order",
          icon: <XCircle className="size-4" />,
          danger: true,
          onClick: () => {
            setConfirmAction({ type: "reject", status: "cancelled" });
            setConfirmOpen(true);
          },
        },
      );
    }

    if (order.status === "awaiting_payment") {
      actions.push(
        { divider: true },
        {
          label: "Confirm Payment & Process",
          icon: <CheckCircle className="size-4" />,
          onClick: () => {
            setConfirmAction({ type: "confirm_payment", status: "processing" });
            setConfirmOpen(true);
          },
        },
        {
          label: "Cancel Order",
          icon: <XCircle className="size-4" />,
          danger: true,
          onClick: () => {
            setConfirmAction({ type: "reject", status: "cancelled" });
            setConfirmOpen(true);
          },
        },
      );
    }

    if (order.status === "awaiting_2nd_payment") {
      actions.push(
        { divider: true },
        {
          label: "Confirm 2nd Payment",
          icon: <CheckCircle className="size-4" />,
          onClick: () => {
            setConfirmAction({ type: "confirm_2nd", status: "processing" });
            setConfirmOpen(true);
          },
        },
      );
    }

    if (order.status === "processing") {
      actions.push(
        { divider: true },
        {
          label: "Mark Finished",
          icon: <CheckCircle className="size-4" />,
          onClick: () => {
            setConfirmAction({ type: "finish", status: "finished" });
            setConfirmOpen(true);
          },
        },
        {
          label: "Cancel Order",
          icon: <XCircle className="size-4" />,
          danger: true,
          onClick: () => {
            setConfirmAction({ type: "reject", status: "cancelled" });
            setConfirmOpen(true);
          },
        },
      );
    }

    return actions;
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "reject" && !rejectReason.trim()) {
      return; // Don't allow empty rejection reason
    }

    setIsActing(true);
    await changeStatus(
      order.id,
      confirmAction.status,
      confirmAction.type === "reject" ? rejectReason.trim() : null,
    );
    setIsActing(false);
    setConfirmOpen(false);
    setRejectReason("");
  };

  const confirmTitle =
    {
      accept: "Accept Order",
      reject: "Reject Order",
      confirm_payment: "Confirm Payment Received",
      confirm_2nd: "Confirm 2nd Payment",
      request_2nd: "Request 2nd Payment",
      finish: "Mark as Finished",
    }[confirmAction?.type] ?? "Confirm";

  const confirmDesc =
    {
      accept: `Accept ${orderNumber}? Customer will be notified to upload payment.`,
      reject: "Provide a reason for rejection.",
      confirm_payment: `Confirm payment received for ${orderNumber} and move to Processing?`,
      confirm_2nd: `Confirm 2nd payment received for ${orderNumber}?`,
      request_2nd: `Move ${orderNumber} to awaiting 2nd payment? Customer will be notified to pay the remaining balance.`,
      finish: `Mark ${orderNumber} as finished? This cannot be undone.`,
    }[confirmAction?.type] ?? "";

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 p-3.5 rounded-xl",
          "bg-brand-800/70 border border-brand-700",
          "hover:border-brand-500 hover:bg-brand-800",
          "transition-all duration-150 cursor-pointer group",
        )}
        onClick={() => {
          setActiveOrder(order.id);
          openSlideOver("order-detail");
        }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-mono font-semibold text-accent-400">
              {orderNumber}
            </p>
            {isWalkIn && (
              <span className="text-xs text-brand-500 font-sans">Walk-in</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge status={order.status} />
            <Dropdown
              trigger={
                <button
                  className="size-6 flex items-center justify-center rounded-md
                             text-brand-500 hover:text-brand-200 hover:bg-brand-700
                             transition-colors duration-150 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Order actions"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              }
              items={getActions()}
              align="right"
            />
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2">
          <User className="size-3.5 text-brand-500 shrink-0" />
          <p className="text-sm font-medium text-brand-200 font-sans truncate">
            {customerName}
          </p>
        </div>

        {/* Stone info */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-brand-600 shrink-0" />
          <p className="text-xs text-brand-400 font-sans capitalize truncate">
            {stoneType}
            {texture && !texture.startsWith("http") ? ` · ${texture}` : ""}
          </p>
        </div>

        {/* Price + payment type */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CreditCard className="size-3.5 text-brand-500 shrink-0" />
            <span className="text-sm font-mono font-semibold text-brand-100">
              {formatPeso(totalPrice)}
            </span>
          </div>
          {paymentType && (
            <span
              className={cn(
                "text-xs font-sans px-1.5 py-0.5 rounded-full",
                paymentType === "full"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-amber-400 bg-amber-500/10",
              )}
            >
              {paymentType === "full" ? "Full" : "Partial"}
            </span>
          )}
        </div>

        {/* Payment progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-brand-500 font-sans">
            <span>Paid: {formatPeso(amountPaid)}</span>
            <span>{paidPct}%</span>
          </div>
          <div className="h-1.5 bg-brand-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                paidPct >= 100 ? "bg-emerald-400" : "bg-accent-500",
              )}
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 pt-0.5 border-t border-brand-700">
          <Clock className="size-3 text-brand-600 shrink-0" />
          <span className="text-xs text-brand-500 font-sans">
            {timeAgo(createdAt)}
          </span>
          <span className="text-xs text-brand-600 font-sans ml-auto">
            {formatDate(createdAt)}
          </span>
        </div>
      </div>

      {/* ── Confirm Dialog ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        loading={isActing}
        onClose={() => {
          setConfirmOpen(false);
          setRejectReason("");
        }}
        onConfirm={handleConfirm}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={
          confirmAction?.type === "accept"
            ? "Yes, Accept"
            : confirmAction?.type === "reject"
              ? "Yes, Reject"
              : confirmAction?.type === "confirm_payment"
                ? "Yes, Process"
                : confirmAction?.type === "confirm_2nd"
                  ? "Yes, Confirm"
                  : "Mark Finished"
        }
        variant={confirmAction?.type === "reject" ? "danger" : "info"}
        // Extra content — rejection reason input
        extra={
          confirmAction?.type === "reject" ? (
            <div className="mt-3">
              <Input
                label="Rejection Reason *"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Payment proof is unreadable. Please resubmit."
                required
              />
              {!rejectReason.trim() && (
                <p className="text-xs text-red-400 font-sans mt-1">
                  Rejection reason is required.
                </p>
              )}
            </div>
          ) : null
        }
      />
    </>
  );
}
