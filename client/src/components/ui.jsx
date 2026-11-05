import { AlertCircle, Inbox, Loader2 } from 'lucide-react'

export function Spinner({ label = 'Loading…', fullPage = false }) {
  return (
    <div
      className={fullPage ? 'grid min-h-[60vh] place-items-center' : 'grid place-items-center py-16'}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-slate-300">
        <Loader2 className="h-9 w-9 animate-spin text-primary-300" aria-hidden="true" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

export function Alert({ children, tone = 'error', className = '' }) {
  const tones = {
    error: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    info: 'border-primary-400/30 bg-primary-500/10 text-primary-100',
    warning: 'border-secondary-400/30 bg-secondary-500/10 text-secondary-100',
  }

  return (
    <div role="alert" className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="surface grid place-items-center px-6 py-16 text-center">
      <Icon size={54} className="text-slate-500" aria-hidden="true" />
      <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const styles = {
    published: 'bg-emerald-500/15 text-emerald-300',
    draft: 'bg-secondary-500/15 text-secondary-300',
    archived: 'bg-slate-500/15 text-slate-300',
  }
  return (
    <span className={`badge ${styles[status] || styles.archived}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  )
}

export function StatCard({ icon: Icon, label, value, accent = 'text-primary-300' }) {
  return (
    <div className="surface-soft p-4">
      <div className={`mb-3 flex items-center gap-2 text-sm font-medium text-slate-400`}>
        {Icon && <Icon size={18} className={accent} aria-hidden="true" />}
        {label}
      </div>
      <div className="text-2xl font-extrabold text-white">{value}</div>
    </div>
  )
}
