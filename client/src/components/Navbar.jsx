import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import useAuthStore from '../store/authStore'

const navLinkClass = ({ isActive }) =>
  `inline-flex min-h-[44px] items-center border-b-[3px] px-1 font-display text-[13px] font-bold uppercase tracking-[0.14em] transition ${
    isActive
      ? 'border-signal-red text-ink'
      : 'border-transparent text-ink-600 hover:border-ink hover:text-ink'
  }`

const mobileLinkClass = ({ isActive }) =>
  `flex min-h-[56px] items-center justify-between border-b-2 border-ink/20 font-display text-xl font-bold uppercase tracking-wide transition ${
    isActive ? 'text-signal-red-dark' : 'text-ink hover:text-signal-red-dark'
  }`

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-arena-50">
      <div className="h-1 bg-signal-red" aria-hidden="true" />
      <nav className="container-page" aria-label="Main navigation">
        <div className="flex h-[68px] items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Quiz Mania home">
            <span className="grid h-9 w-9 place-items-center border-2 border-ink bg-ink font-display text-xl font-bold leading-none text-white">
              Q
            </span>
            <span className="font-display text-[22px] font-bold uppercase leading-none tracking-[-0.01em] text-ink">
              Quiz Mania
            </span>
            <span className="mt-[-14px] h-2 w-2 bg-signal-red" aria-hidden="true" />
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <NavLink to="/quiz/join" className={navLinkClass}>
              Play
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/quiz/create" className={navLinkClass}>
                  Create
                </NavLink>
                <NavLink to="/my-results" className={navLinkClass}>
                  My results
                </NavLink>
              </>
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <span className="flex items-center gap-2 border-2 border-ink bg-white px-2.5 py-1.5">
                  <span className="grid h-5 w-5 place-items-center bg-signal-blue font-display text-[11px] font-bold uppercase text-white">
                    {(user?.username || 'P').slice(0, 1)}
                  </span>
                  <span className="max-w-[9rem] truncate font-display text-[12px] font-bold uppercase tracking-[0.12em] text-ink">
                    {user?.username || 'Player'}
                  </span>
                </span>
                <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center border-2 border-ink bg-white text-ink transition hover:bg-ink hover:text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>

        {open && (
          <div id="mobile-menu" className="border-t-2 border-ink pb-6 pt-2 lg:hidden">
            <NavLink to="/quiz/join" className={mobileLinkClass}>
              <span>Play a quiz</span>
              <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Code</span>
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={mobileLinkClass}>
                  <span>Dashboard</span>
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Host</span>
                </NavLink>
                <NavLink to="/quiz/create" className={mobileLinkClass}>
                  <span>Create a quiz</span>
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">New</span>
                </NavLink>
                <NavLink to="/my-results" className={mobileLinkClass}>
                  <span>My results</span>
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Scores</span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary mt-4 w-full justify-start"
                >
                  Log out{user?.username ? ` (${user.username})` : ''}
                </button>
              </>
            ) : (
              <div className="mt-4 grid gap-2">
                <Link to="/login" className="btn btn-secondary">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Create free account
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
