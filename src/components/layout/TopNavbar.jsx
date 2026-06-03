import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Menu, Wand2 } from "lucide-react";
import { useLocation } from "react-router-dom";

// ── Route → page title map ─────────────────────────────────────────────────
const PAGE_TITLES = {
  "/customer/catalog": "Catalog",
  "/customer/customize": "3D Customizer",
  "/customer/orders": "My Orders",
  "/customer/messages": "Messages",
  "/customer/payment": "Payment",
  "/admin/dashboard": "Dashboard",
  "/admin/orders": "Order Management",
  "/admin/inventory": "Inventory",
  "/admin/designs": "Designs",
  "/admin/customize": "3D Customizer",
  "/admin/messages": "Message Hub",
  "/admin/users": "User Accounts",
  "/admin/reports": "Reports",
  "/admin/settings": "System Settings",
};

export default function TopNavbar({ role = "customer" }) {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { pathname } = useLocation();

  const pageTitle = PAGE_TITLES[pathname] ?? "Double Seven";

  return (
    <header
      className={cn(
        "h-16 shrink-0",
        "flex items-center gap-4 px-4 md:px-6",
        "bg-brand-900/80 backdrop-blur-md",
        "border-b border-brand-800",
        "sticky top-0 z-30",
      )}
    >
      {/* ── Left: Hamburger + Page Title ────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex items-center justify-center size-9 rounded-lg
                     text-brand-400 hover:text-brand-100 hover:bg-brand-800
                     transition-colors duration-150 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Page Title */}
        <div className="min-w-0">
          <h1
            className="font-display text-base md:text-lg font-semibold
                         text-brand-100 truncate leading-tight"
          >
            {pageTitle}
          </h1>
          {role === "admin" && (
            <p className="text-xs text-brand-500 hidden sm:block leading-tight">
              Admin Portal
            </p>
          )}
        </div>
      </div>

      {/* ── Right: Actions ───────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick Customizer shortcut (customer only) */}
        {role === "customer" && (
          <Tooltip content="Open Customizer" position="bottom">
            <Button
              variant="accent"
              size="sm"
              iconLeft={<Wand2 className="size-3.5" />}
              className="hidden sm:flex"
              onClick={() => (window.location.href = "/customer/customize")}
            >
              Customize
            </Button>
          </Tooltip>
        )}

        {/* Avatar */}
        <div className="pl-1.5 border-l border-brand-800 ml-1">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="sm"
            className="cursor-pointer hover:ring-2 hover:ring-accent-500/50
                       transition-all duration-150"
          />
        </div>
      </div>
    </header>
  );
}
