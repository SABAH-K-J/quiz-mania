import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, LayoutDashboard, LogIn, LogOut, Menu, PlusCircle, Trophy, X, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'

const navLinkClass = ({ isActive }) =>
  `inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
    isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/75 backdrop-blur-xl">
      <nav className="container-page" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 rounded-xl py-1 pr-2" aria-label="Quiz Mania home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-secondary-400 to-accent-pink text-ink-950 shadow-glow">
              <Zap size={20} strokeWidth={2.6} aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Quiz<span className="text-secondary-300">Mania</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <NavLink to="/quiz/join" className={navLinkClass}>
              <Trophy size={17} aria-hidden="true" /> Join a quiz
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <LayoutDashboard size={17} aria-hidden="true" /> Dashboard
                </NavLink>
                <NavLink to="/quiz/create" className={navLinkClass}>
                  <PlusCircle size={17} aria-hidden="true" /> Create
                </NavLink>
                <NavLink to="/my-results" className={navLinkClass}>
                  <BarChart3 size={17} aria-hidden="true" /> My results
                </NavLink>
              </>
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-[10rem] truncate rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                  {user?.username || 'Player'}
                </span>
                <button type="button" onClick={handleLogout} className="btn-ghost">
                  <LogOut size={17} aria-hidden="true" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  <LogIn size={17} aria-hidden="true" /> Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Create free account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="btn-ghost lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>

        {open && (
          <div id="mobile-menu" className="grid gap-1 border-t border-white/10 py-3 lg:hidden">
            <NavLink to="/quiz/join" className={navLinkClass}>
              <Trophy size={17} aria-hidden="true" /> Join a quiz
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <LayoutDashboard size={17} aria-hidden="true" /> Dashboard
                </NavLink>
                <NavLink to="/quiz/create" className={navLinkClass}>
                  <PlusCircle size={17} aria-hidden="true" /> Create a quiz
                </NavLink>
                <NavLink to="/my-results" className={navLinkClass}>
                  <BarChart3 size={17} aria-hidden="true" /> My results
                </NavLink>
                <button type="button" onClick={handleLogout} className="btn-secondary mt-2 justify-start">
                  <LogOut size={17} aria-hidden="true" /> Log out {user?.username ? `(${user.username})` : ''}
                </button>
              </>
            ) : (
              <div className="mt-2 grid gap-2">
                <Link to="/login" className="btn-secondary">
                  <LogIn size={17} aria-hidden="true" /> Log in
                </Link>
                <Link to="/register" className="btn-primary">
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
