import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import Logo from '../components/brand/Logo'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-950 text-white shadow-sm shadow-brand-950/20'
      : 'text-ink-600 hover:bg-brand-50 hover:text-brand-900'
  }`
}

/**
 * Signed-in shell: sidebar navigation, the current user, and a sign-out
 * button. Pages render into <Outlet />. Navigation stays role-aware.
 */
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'
  const initial = user.name.charAt(0).toUpperCase()

  async function handleSignOut() {
    setSigningOut(true)

    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  const closeMobile = () => setMobileOpen(false)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-1">
        <NavLink
          to="/dashboard"
          onClick={closeMobile}
          className="inline-flex min-w-0 items-center rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <Logo size="sm" />
        </NavLink>
      </div>

      <div className="mt-5 rounded-xl bg-brand-50/70 px-3 py-2.5 ring-1 ring-brand-100/70">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-brand-700 uppercase">
          <ShieldCheck size={12} aria-hidden />
          {isAdmin ? 'Administrator' : 'Staff workspace'}
        </p>
        <p className="mt-1 truncate text-xs text-ink-500">
          Signed in as {user.name}
        </p>
      </div>

      <nav
        aria-label="Main navigation"
        className="mt-6 flex-1 space-y-1 overflow-y-auto pb-4"
      >
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.16em] text-ink-400 uppercase">
          Workspace
        </p>

        <NavLink to="/dashboard" className={navLinkClasses} onClick={closeMobile}>
          <LayoutDashboard size={18} aria-hidden />
          Dashboard
        </NavLink>

        <NavLink to="/products" className={navLinkClasses} onClick={closeMobile}>
          <Package size={18} aria-hidden />
          Products
        </NavLink>

        <NavLink to="/sales" className={navLinkClasses} onClick={closeMobile}>
          <Receipt size={18} aria-hidden />
          Sales
        </NavLink>

        <NavLink to="/inventory" className={navLinkClasses} onClick={closeMobile}>
          <Boxes size={18} aria-hidden />
          Inventory
        </NavLink>

        <NavLink to="/customers" className={navLinkClasses} onClick={closeMobile}>
          <UserRound size={18} aria-hidden />
          Customers
        </NavLink>

        <NavLink to="/suppliers" className={navLinkClasses} onClick={closeMobile}>
          <Truck size={18} aria-hidden />
          Suppliers
        </NavLink>

        {isAdmin && (
          <NavLink to="/users" className={navLinkClasses} onClick={closeMobile}>
            <Users size={18} aria-hidden />
            Users
          </NavLink>
        )}

        {isAdmin && (
          <>
            <p className="px-3 pt-6 pb-2 text-[11px] font-semibold tracking-[0.16em] text-ink-400 uppercase">
              Insights
            </p>
            <NavLink
              to="/analytics"
              className={navLinkClasses}
              onClick={closeMobile}
            >
              <BarChart3 size={18} aria-hidden />
              Business analytics
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto rounded-xl border border-ink-200 bg-ink-50/70 p-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-800">
              {user.name}
            </p>
            <p className="truncate text-xs capitalize text-ink-500">
              {user.role}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          fullWidth
          className="mt-3"
          loading={signingOut}
          onClick={() => void handleSignOut()}
        >
          <LogOut size={16} aria-hidden />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[276px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-ink-200 bg-white px-4 py-5 lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {/* Mobile header + drawer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <Logo size="sm" />
        </NavLink>

        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-xs font-semibold text-white"
          >
            {initial}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-ink-200 p-2 text-ink-600 transition-colors hover:bg-ink-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu size={20} aria-hidden />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobile}
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
          />
          <div className="relative h-full w-[290px] max-w-[85vw] bg-white px-4 py-5 shadow-2xl">
            <button
              type="button"
              onClick={closeMobile}
              className="absolute top-5 right-3 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              aria-label="Close navigation menu"
            >
              <X size={18} aria-hidden />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main className="min-w-0 overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
