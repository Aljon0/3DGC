import Avatar from "@/components/ui/Avatar";
import Tooltip from "@/components/ui/Tooltip";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Palette,
  Settings,
  ShoppingBag,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// ── Nav definitions ────────────────────────────────────────────────────────
const CUSTOMER_NAV = [
  {
    to: "/customer/catalog",
    label: "Catalog",
    icon: <BookOpen className="size-4" />,
  },
  {
    to: "/customer/customize",
    label: "Customizer",
    icon: <Wand2 className="size-4" />,
  },
  {
    to: "/customer/orders",
    label: "My Orders",
    icon: <ShoppingBag className="size-4" />,
  },
  {
    to: "/customer/messages",
    label: "Messages",
    icon: <MessageSquare className="size-4" />,
  },
  {
    to: "/customer/payment",
    label: "Payment",
    icon: <CreditCard className="size-4" />,
  },
];

const ADMIN_NAV = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: <ClipboardList className="size-4" />,
  },
  {
    to: "/admin/inventory",
    label: "Inventory",
    icon: <Package className="size-4" />,
  },
  {
    to: "/admin/designs",
    label: "Designs",
    icon: <Palette className="size-4" />,
  },
  {
    to: "/admin/customize",
    label: "Customizer",
    icon: <Wand2 className="size-4" />,
  },
  {
    to: "/admin/messages",
    label: "Messages",
    icon: <MessageSquare className="size-4" />,
  },
  { to: "/admin/users", label: "Users", icon: <Users className="size-4" /> },
  {
    to: "/admin/reports",
    label: "Reports",
    icon: <BarChart3 className="size-4" />,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: <Settings className="size-4" />,
  },
];

// ── Sidebar Component ──────────────────────────────────────────────────────
export default function Sidebar({ role = "customer" }) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleCollapse } =
    useUIStore();

  const nav = role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  // Sidebar width token
  const W = {
    expanded: "w-60",
    collapsed: "w-16",
  };

  return (
    <>
      {/* ── Mobile Backdrop ─────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar Panel ───────────────────────────────── */}
      {/* Mobile: slide-in drawer | Desktop: fixed rail */}
      <aside
        className={cn(
          // Base
          "fixed top-0 left-0 h-full z-50",
          "flex flex-col",
          "bg-brand-900 border-r border-brand-800",
          "transition-all duration-300 ease-out",

          // Desktop width based on collapsed state
          "lg:relative lg:translate-x-0",
          sidebarCollapsed ? W.collapsed : W.expanded,

          // Mobile: translate off-screen when closed
          "max-lg:w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* ── Logo + Collapse Toggle ─────────────────── */}
        <div
          className={cn(
            "flex items-center h-16 px-4 shrink-0",
            "border-b border-brand-800",
            sidebarCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {/* Logo */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="size-8 rounded-lg bg-accent-500/20 border border-accent-500/40
                              flex items-center justify-center shrink-0"
              >
                <Layers className="size-4 text-accent-400" />
              </div>
              <div className="overflow-hidden">
                <p className="font-display text-sm font-semibold text-brand-100 truncate leading-tight">
                  Double Seven
                </p>
                <p className="text-xs text-brand-500 truncate leading-tight">
                  Monument System
                </p>
              </div>
            </div>
          )}

          {/* Collapsed logo icon only */}
          {sidebarCollapsed && (
            <div
              className="size-8 rounded-lg bg-accent-500/20 border border-accent-500/40
                            flex items-center justify-center"
            >
              <Layers className="size-4 text-accent-400" />
            </div>
          )}

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={toggleCollapse}
            className={cn(
              "hidden lg:flex items-center justify-center",
              "size-7 rounded-lg",
              "text-brand-500 hover:text-brand-200",
              "hover:bg-brand-800 transition-colors duration-150",
              sidebarCollapsed && "mt-0",
            )}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center size-7 rounded-lg
                       text-brand-400 hover:text-brand-200 hover:bg-brand-800
                       transition-colors duration-150"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Nav Items ───────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {nav.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              collapsed={sidebarCollapsed}
              onNavigate={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* ── User Profile Footer ──────────────────────── */}
        <div
          className={cn(
            "shrink-0 border-t border-brand-800 p-3",
            sidebarCollapsed ? "flex justify-center" : "",
          )}
        >
          {sidebarCollapsed ? (
            <Tooltip content={user?.name} position="right">
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="sm"
                className="cursor-pointer"
              />
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar src={user?.avatar} name={user?.name} size="sm" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-brand-100 truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-brand-500 truncate leading-tight">
                  {user?.email}
                </p>
              </div>
              <Tooltip content="Logout" position="top">
                <button
                  onClick={logout}
                  className="size-7 flex items-center justify-center rounded-lg
                             text-brand-500 hover:text-red-400 hover:bg-red-500/10
                             transition-colors duration-150 shrink-0 cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="size-4" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ── NavItem ────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, onNavigate }) {
  return (
    <Tooltip
      content={collapsed ? item.label : null}
      position="right"
      delay={200}
    >
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5",
            "text-sm font-medium font-sans",
            "transition-all duration-150",
            "group relative",

            // Active state
            isActive
              ? "bg-accent-500/10 text-accent-400 border border-accent-500/20"
              : "text-brand-400 hover:text-brand-100 hover:bg-brand-800 border border-transparent",

            // Collapsed: center the icon
            collapsed && "justify-center px-0 w-10 mx-auto",
          )
        }
      >
        {/* Icon */}
        <span className="shrink-0">{item.icon}</span>

        {/* Label — hidden when collapsed */}
        {!collapsed && <span className="truncate">{item.label}</span>}

        {/* Badge */}
        {!collapsed && item.badge != null && (
          <span
            className="ml-auto text-xs bg-accent-500 text-white
                           px-1.5 py-0.5 rounded-full font-medium min-w-5 text-center"
          >
            {item.badge}
          </span>
        )}
      </NavLink>
    </Tooltip>
  );
}
