import SlideOver from "@/components/shared/SlideOver";
import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useOrders } from "@/hooks/useOrders";
import { cn, formatDate, formatDateTime, formatPeso } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import {
  Clock,
  CreditCard,
  FileImage,
  MessageSquare,
  Package,
  User,
} from "lucide-react";
import PaymentProofUploader from "./PaymentProofUploader";

// ── Human-readable labels ─────────────────────────────────────────────────
const STONE_LABELS = {
  gravestone: "Gravestone",
  standardGravestone: "Standard Gravestone",
  blackGalaxyGravestone: "Black Galaxy Gravestone",
  urn: "Urn",
  "table-sign": "Table Sign",
  tableSign: "Table Sign",
  pictureFrame: "Picture Frame",
  base: "Base",
};

const TEXTURE_LABEL = (texture) => {
  if (!texture) return "—";
  if (texture.startsWith("http")) return "Custom texture";
  return texture;
};

export default function OrderDetailSlideOver({ role = "admin" }) {
  const { activeOrder, changeStatus } = useOrders();
  const { slideOverOpen, closeSlideOver } = useUIStore();

  const order = activeOrder;
  if (!order) return null;

  // ── Normalize field names (DB snake_case) ─────────────────────────────
  const orderNumber = order.order_number ?? order.orderNumber ?? "—";
  const customerName = order.customer_name ?? order.customerName ?? "—";
  const stoneType = order.stone_type ?? order.stoneType ?? "—";
  const texture = order.texture ?? null;
  const selectedSize = order.selected_size ?? order.selectedSize ?? null;
  const dimensions = order.dimensions ?? null;
  const decals = order.decals ?? [];
  const snapshotUrl = order.snapshot_url ?? order.snapshot ?? null;
  const paymentProofUrl =
    order.payment_proof_url ?? order.paymentProofUrl ?? null;
  const isWalkIn = order.is_walk_in ?? order.isWalkIn ?? false;
  const paymentType = order.payment_type ?? order.paymentType ?? null;
  const basePrice = Number(order.base_price ?? order.basePrice ?? 0);
  const addOnsPrice = Number(order.add_ons_price ?? order.addOnsPrice ?? 0);
  const totalPrice = Number(order.total_price ?? order.totalPrice ?? 0);
  const amountPaid = Number(order.amount_paid ?? order.amountPaid ?? 0);
  const balance = Number(order.balance ?? 0);
  const notes = order.notes ?? null;
  const rejectionReason =
    order.rejection_reason ?? order.rejectionReason ?? null;
  const createdAt = order.created_at ?? order.createdAt ?? null;
  const updatedAt = order.updated_at ?? order.updatedAt ?? null;

  // Payment progress
  const paidPct =
    totalPrice > 0 ? Math.round((amountPaid / totalPrice) * 100) : 0;

  // Size display — use selected_size if available, fall back to dimensions
  const sizeDisplay = (() => {
    if (selectedSize) return selectedSize.replace("x", " × ");
    if (dimensions?.width && dimensions?.height) {
      return `${dimensions.width} × ${dimensions.height} cm`;
    }
    return "—";
  })();

  return (
    <SlideOver
      open={slideOverOpen}
      onClose={closeSlideOver}
      title={orderNumber}
      description={`Created ${formatDate(createdAt)}`}
      width="lg"
      footer={
        role === "admin" ? (
          <div className="flex gap-2 flex-wrap justify-end">
            {order.status === "new" && (
              <>
                <Button
                  variant="solid"
                  size="md"
                  onClick={() => changeStatus(order.id, "awaiting_payment")}
                >
                  Accept Order
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => {
                    const reason = window.prompt("Enter rejection reason:");
                    if (reason?.trim())
                      changeStatus(order.id, "cancelled", reason.trim());
                  }}
                >
                  Reject
                </Button>
              </>
            )}

            {order.status === "awaiting_payment" && (
              <>
                <Button
                  variant="solid"
                  size="md"
                  onClick={() => changeStatus(order.id, "processing")}
                >
                  Confirm Payment Received
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => {
                    const reason = window.prompt("Cancellation reason:");
                    if (reason?.trim())
                      changeStatus(order.id, "cancelled", reason.trim());
                  }}
                >
                  Cancel
                </Button>
              </>
            )}

            {order.status === "awaiting_2nd_payment" && (
              <Button
                variant="solid"
                size="md"
                onClick={() => changeStatus(order.id, "processing")}
              >
                Confirm 2nd Payment
              </Button>
            )}

            {order.status === "processing" && (
              <>
                {/* Only show if partial and still has balance */}
                {paymentType === "partial" && balance > 0 && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() =>
                      changeStatus(order.id, "awaiting_2nd_payment")
                    }
                  >
                    Request 2nd Payment
                  </Button>
                )}
                <Button
                  variant="solid"
                  size="md"
                  onClick={() => changeStatus(order.id, "finished")}
                >
                  Mark as Finished
                </Button>
              </>
            )}
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* ── Status badges ──────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={order.status} />
          <span
            className="text-xs px-2 py-0.5 rounded-full bg-brand-800
                           border border-brand-700 text-brand-400 font-sans capitalize"
          >
            {STONE_LABELS[stoneType] ?? stoneType}
          </span>
          {isWalkIn && (
            <span
              className="text-xs px-2 py-0.5 rounded-full bg-brand-800
                             border border-brand-700 text-brand-400 font-sans"
            >
              Walk-in
            </span>
          )}
        </div>

        {/* ── 3D Snapshot ────────────────────────────── */}
        {snapshotUrl ? (
          <div className="rounded-xl overflow-hidden border border-brand-700 bg-brand-800">
            <img
              src={snapshotUrl}
              alt="Design snapshot"
              className="w-full object-contain max-h-48"
            />
            <p className="text-xs text-center text-brand-500 py-2 font-sans">
              Design Preview
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl border border-dashed border-brand-700
                          bg-brand-800/50 flex items-center justify-center
                          h-32 text-brand-500 text-sm font-sans gap-2"
          >
            <FileImage className="size-5" />
            No design snapshot
          </div>
        )}

        {/* ── Customer ───────────────────────────────── */}
        <Section title="Customer" icon={<User className="size-4" />}>
          <InfoRow label="Name" value={customerName} />
          <InfoRow label="Type" value={isWalkIn ? "Walk-in" : "Online"} />
        </Section>

        {/* ── Specifications ─────────────────────────── */}
        <Section title="Specifications" icon={<Package className="size-4" />}>
          <InfoRow label="Stone" value={STONE_LABELS[stoneType] ?? stoneType} />
          <InfoRow label="Texture" value={TEXTURE_LABEL(texture)} />
          <InfoRow label="Size" value={sizeDisplay} />
          <InfoRow
            label="Elements"
            value={`${decals.length} decal${decals.length !== 1 ? "s" : ""}`}
          />
        </Section>

        {/* ── Pricing ────────────────────────────────── */}
        <Section title="Pricing" icon={<CreditCard className="size-4" />}>
          <InfoRow label="Base Price" value={formatPeso(basePrice)} />
          <InfoRow label="Add-ons" value={formatPeso(addOnsPrice)} />
          <div className="border-t border-brand-700 pt-2 mt-1">
            <InfoRow label="Total" value={formatPeso(totalPrice)} highlight />
          </div>
          <InfoRow
            label="Payment"
            value={
              paymentType === "full"
                ? "Full Payment"
                : paymentType === "partial"
                  ? "Partial Payment"
                  : "—"
            }
          />
          <InfoRow label="Amount Paid" value={formatPeso(amountPaid)} />
          <InfoRow
            label="Balance"
            value={formatPeso(balance)}
            highlight={balance > 0}
          />
        </Section>

        {/* ── Payment Progress ────────────────────────── */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-brand-400">Payment Progress</span>
            <span className="text-brand-200 font-mono">{paidPct}%</span>
          </div>
          <div className="h-2 bg-brand-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                paidPct >= 100 ? "bg-emerald-400" : "bg-accent-500",
              )}
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>

        {/* ── Payment Proof (admin view) ──────────────── */}
        {role === "admin" && paymentProofUrl && (
          <Section
            title="Payment Proof"
            icon={<FileImage className="size-4" />}
          >
            <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={paymentProofUrl}
                alt="Payment proof"
                className="w-full rounded-xl border border-brand-700 object-contain max-h-48"
              />
            </a>
          </Section>
        )}

        {/* ── Payment Proof Upload (customer) ─────────── */}
        {role === "customer" &&
          (order.status === "awaiting_payment" ||
            order.status === "awaiting_2nd_payment") && (
            <Section
              title="Payment Proof"
              icon={<FileImage className="size-4" />}
            >
              <PaymentProofUploader order={order} />
            </Section>
          )}

        {/* ── Notes ──────────────────────────────────── */}
        {notes && (
          <Section title="Notes" icon={<MessageSquare className="size-4" />}>
            <p
              className="text-sm text-brand-300 font-sans leading-relaxed
                          bg-brand-800 rounded-lg px-3 py-2.5 border border-brand-700"
            >
              {notes}
            </p>
          </Section>
        )}

        {/* ── Rejection Reason ────────────────────────── */}
        {role === "customer" &&
          order.status === "cancelled" &&
          rejectionReason && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-semibold text-red-400 font-sans mb-1">
                Order Rejected
              </p>
              <p className="text-sm text-red-300 font-sans">
                {rejectionReason}
              </p>
            </div>
          )}

        {/* ── Pending approval notice (customer view) ── */}
        {role === "customer" && order.status === "new" && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-xs font-semibold text-blue-400 font-sans mb-1">
              Awaiting Admin Approval
            </p>
            <p className="text-sm text-blue-300 font-sans">
              Your order is being reviewed. You will be notified once it is
              accepted and ready for payment.
            </p>
          </div>
        )}

        {/* ── Timeline ───────────────────────────────── */}
        <Section title="Timeline" icon={<Clock className="size-4" />}>
          <InfoRow label="Placed" value={formatDateTime(createdAt)} />
          <InfoRow label="Updated" value={formatDateTime(updatedAt)} />
        </Section>
      </div>
    </SlideOver>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-accent-400">{icon}</span>
        <h4 className="text-xs font-semibold font-sans uppercase tracking-wider text-brand-400">
          {title}
        </h4>
      </div>
      <div className="space-y-2 pl-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight, capitalize }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-brand-400 font-sans shrink-0">{label}</span>
      <span
        className={cn(
          "text-sm font-sans text-right",
          highlight ? "text-accent-400 font-semibold" : "text-brand-200",
          capitalize && "capitalize",
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
