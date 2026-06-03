import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

/**
 * CustomerLayout
 * Shell for all /customer/* pages.
 * Sidebar + TopNavbar + scrollable main content area.
 */
export default function CustomerLayout() {
  return (
    <div className="flex h-full bg-brand-950 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────── */}
      <Sidebar role="customer" />

      {/* ── Main Area ───────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0",
          "transition-all duration-300",
        )}
      >
        {/* Top navbar */}
        <TopNavbar role="customer" />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Page padding wrapper */}
          <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
