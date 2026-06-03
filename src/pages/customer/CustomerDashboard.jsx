import StatCard from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { InlineSpinner } from "@/components/ui/Spinner";
import { useOrders } from "@/hooks/useOrders";
import { cn, formatPeso, timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import {
  ArrowRight,
  Clock,
  CreditCard,
  MessageSquare,
  Package,
  ShoppingBag,
  Wand2,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setPageTitle } = useUIStore();
  const { orders, isLoading } = useOrders({ autoFetch: true });

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  // ── Derived stats ──────────────────────────────────────────────────────
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status === "processing").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.amountPaid, 0);
  const pendingBalance = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.balance, 0);

  const recentOrders = orders.slice(0, 5);

  // ── Quick actions ──────────────────────────────────────────────────────
  const quickActions = [
    {
      icon: <Wand2 className="size-5" />,
      label: "Open Customizer",
      desc: "Design a new monument",
      to: "/customer/customize",
      accent: true,
    },
    {
      icon: <ShoppingBag className="size-5" />,
      label: "My Orders",
      desc: "View order history",
      to: "/customer/orders",
    },
    {
      icon: <MessageSquare className="size-5" />,
      label: "Messages",
      desc: "Chat with our team",
      to: "/customer/messages",
    },
    {
      icon: <CreditCard className="size-5" />,
      label: "Payment Info",
      desc: "GCash & BPI details",
      to: "/customer/payment",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Greeting ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-50">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-brand-400 font-sans mt-1">
            {new Date().toLocaleDateString("en-PH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="solid"
          size="md"
          iconLeft={<Wand2 className="size-4" />}
          onClick={() => navigate("/customer/customize")}
        >
          Start Designing
        </Button>
      </div>

      {/* ── Stats ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={<ShoppingBag className="size-5" />}
          loading={isLoading}
        />
        <StatCard
          label="In Progress"
          value={activeOrders}
          icon={<Clock className="size-5" />}
          loading={isLoading}
          accent={activeOrders > 0}
        />
        <StatCard
          label="Total Spent"
          value={formatPeso(totalSpent, true)}
          icon={<CreditCard className="size-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Pending Balance"
          value={formatPeso(pendingBalance, true)}
          icon={<Package className="size-5" />}
          loading={isLoading}
          accent={pendingBalance > 0}
        />
      </div>

      {/* ── Quick Actions ────────────────────────────── */}
      <div>
        <h3
          className="font-display text-sm font-semibold text-brand-300
                       uppercase tracking-wider mb-4"
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className={cn(
                "flex flex-col gap-3 p-4 rounded-2xl text-left",
                "border transition-all duration-200",
                "hover:shadow-panel hover:-translate-y-0.5",
                action.accent
                  ? "bg-accent-500/10 border-accent-500/20 hover:border-accent-500/40"
                  : "bg-brand-900 border-brand-800 hover:border-brand-600",
              )}
            >
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center",
                  action.accent
                    ? "bg-accent-500/20 text-accent-400"
                    : "bg-brand-800 text-brand-400",
                )}
              >
                {action.icon}
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-semibold font-sans",
                    action.accent ? "text-accent-300" : "text-brand-100",
                  )}
                >
                  {action.label}
                </p>
                <p className="text-xs text-brand-500 font-sans mt-0.5">
                  {action.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Orders ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-display text-sm font-semibold text-brand-300
                         uppercase tracking-wider"
          >
            Recent Orders
          </h3>
          <Button
            variant="ghost"
            size="sm"
            iconRight={<ArrowRight className="size-3.5" />}
            onClick={() => navigate("/customer/orders")}
          >
            View All
          </Button>
        </div>

        {isLoading ? (
          <InlineSpinner />
        ) : recentOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-7" />}
            title="No orders yet"
            description="Place your first order from the customizer."
            action={{
              label: "Start Designing",
              onClick: () => navigate("/customer/customize"),
              icon: <Wand2 className="size-4" />,
            }}
            size="sm"
          />
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate("/customer/orders")}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl",
                  "bg-brand-900 border border-brand-800",
                  "hover:border-brand-600 transition-all duration-150",
                  "cursor-pointer group",
                )}
              >
                {/* Order icon */}
                <div
                  className="size-10 rounded-xl bg-brand-800 border border-brand-700
                                flex items-center justify-center shrink-0"
                >
                  <Package className="size-5 text-brand-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-mono font-semibold text-accent-400">
                      {order.orderNumber}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-brand-500 font-sans mt-0.5 capitalize">
                    {order.stoneType} · {order.texture} ·{" "}
                    {timeAgo(order.createdAt)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-semibold text-brand-100">
                    {formatPeso(order.totalPrice)}
                  </p>
                  {order.balance > 0 && (
                    <p className="text-xs text-amber-400 font-sans">
                      Bal: {formatPeso(order.balance)}
                    </p>
                  )}
                </div>

                <ArrowRight
                  className="size-4 text-brand-600
                                       group-hover:text-brand-400
                                       transition-colors duration-150 shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
