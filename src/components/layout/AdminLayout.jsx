import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import Sidebar   from './Sidebar'
import TopNavbar from './TopNavbar'

/**
 * AdminLayout
 * Shell for all /admin/* pages.
 * Identical structure to CustomerLayout but passes role="admin"
 * so Sidebar and Navbar render the correct nav items and labels.
 */
export default function AdminLayout() {


  return (
    <div className="flex h-full bg-brand-950 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────── */}
      <Sidebar role="admin" />

      {/* ── Main Area ───────────────────────────────── */}
      <div className={cn(
        'flex flex-col flex-1 min-w-0',
        'transition-all duration-300',
      )}>

        {/* Top navbar */}
        <TopNavbar role="admin" />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Page padding — wider max-width for admin data tables */}
          <div className="p-4 md:p-6 max-w-screen-2xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}