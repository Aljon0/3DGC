import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Layers, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

/**
 * PublicLayout
 * Wraps Landing, Login, Register pages.
 * Minimal top nav — no sidebar.
 */
export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    { to: '/',         label: 'Home',     end: true },
    { to: '/login',    label: 'Login' },
    { to: '/register', label: 'Get Started' },
  ]

  return (
    <div className="min-h-full flex flex-col bg-brand-950">

      {/* ── Top Navigation ─────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-brand-800/60
                         bg-brand-950/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-accent-500/20 border border-accent-500/40
                            flex items-center justify-center
                            group-hover:bg-accent-500/30 transition-colors duration-150">
              <Layers className="size-4 text-accent-400" />
            </div>
            <div>
              <span className="font-display text-sm font-semibold text-brand-100 block leading-tight">
                Double Seven
              </span>
              <span className="text-xs text-brand-500 block leading-tight">
                Monument Customizer
              </span>
            </div>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.slice(0, -1).map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-lg text-sm font-medium font-sans',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-accent-400 bg-accent-500/10'
                    : 'text-brand-400 hover:text-brand-100 hover:bg-brand-800',
                )}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="w-px h-5 bg-brand-700 mx-2" />

            <Button
              variant="solid"
              size="sm"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden flex items-center justify-center size-9 rounded-lg
                       text-brand-400 hover:text-brand-100 hover:bg-brand-800
                       transition-colors duration-150"
          >
            {mobileMenuOpen
              ? <X    className="size-5" />
              : <Menu className="size-5" />
            }
          </button>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-800 bg-brand-900 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center px-3 py-2.5 rounded-lg',
                    'text-sm font-medium font-sans w-full',
                    'transition-colors duration-150',
                    isActive
                      ? 'text-accent-400 bg-accent-500/10'
                      : 'text-brand-300 hover:text-brand-100 hover:bg-brand-800',
                  )}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ──────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-brand-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-4 text-sm text-brand-500 font-sans">
          <p>© {new Date().getFullYear()} Double Seven Monuments. All rights reserved.</p>
          <p>77 Memorial Ave., Imus, Cavite</p>
        </div>
      </footer>
    </div>
  )
}