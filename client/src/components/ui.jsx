import { useRef } from 'react'
import { AlertCircle, Check, CheckCircle2, Copy, Info, TriangleAlert } from 'lucide-react'

export function Spinner({ label = 'Loading…', fullPage = false }) {
  return (
    <div
      className={fullPage ? 'grid min-h-[60vh] place-items-center' : 'grid place-items-center py-16'}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 animate-pulse bg-signal-red" />
          <span className="h-3 w-3 animate-pulse bg-signal-yellow [animation-delay:120ms]" />
          <span className="h-3 w-3 animate-pulse bg-signal-blue [animation-delay:240ms]" />
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink-600">{label}</span>
      </div>
    </div>
  )
}

export function Alert({ children, tone = 'error', className = '' }) {
  const config = {
    error: { border: 'border-signal-red', bg: 'bg-signal-red-soft', Icon: AlertCircle, icon: 'text-signal-red-dark' },
    success: { border: 'border-signal-green', bg: 'bg-signal-green-soft', Icon: CheckCircle2, icon: 'text-signal-green' },
    info: { border: 'border-ink', bg: 'bg-arena-50', Icon: Info, icon: 'text-signal-blue' },
    warning: { border: 'border-signal-yellow-dark', bg: 'bg-signal-yellow-soft', Icon: TriangleAlert, icon: 'text-signal-yellow-dark' },
  }[tone] || {}

  const { border, bg, Icon, icon } = config

  return (
    <div role="alert" className={`flex items-start gap-3 border-2 ${border} ${bg} px-4 py-3 text-sm text-ink ${className}`}>
      <Icon size={19} className={`mt-0.5 shrink-0 ${icon}`} aria-hidden="true" />
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="badge status-quiet">No entries</span>
        {Icon && <Icon size={17} aria-hidden="true" />}
      </div>
      <div className="px-5 py-12 text-center sm:px-8 sm:py-16">
        <p className="num text-6xl text-arena-300 sm:text-7xl" aria-hidden="true">
          00
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">{description}</p>}
        {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
      </div>
    </div>
  )
}

export function PageHeader({ title, description, actions, meta }) {
  return (
    <header className="mb-8 border-b-2 border-ink pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {meta && <div className="mb-3 flex flex-wrap items-center gap-2">{meta}</div>}
          <h1 className="display-lg">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function StatusBadge({ status }) {
  const config = {
    published: { label: 'Live', className: 'status-live', dot: true },
    draft: { label: 'Draft', className: 'status-draft' },
    archived: { label: 'Archived', className: 'status-quiet' },
  }[status] || { label: status || 'Unknown', className: 'status-quiet' }

  return (
    <span className={`badge ${config.className}`}>
      {config.dot && <span className="h-1.5 w-1.5 animate-lamp bg-white" aria-hidden="true" />}
      {config.label}
    </span>
  )
}

export function StatStrip({ items, className = '' }) {
  return (
    <section aria-label="Key numbers" className={`score-strip ${className}`}>
      {items.map(({ label, value, note, tone = 'text-ink' }) => (
        <div key={label} className="score-cell">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">{label}</p>
          <p className={`num mt-2 text-4xl sm:text-5xl ${tone}`}>{value}</p>
          {note && <p className="mt-1.5 text-xs leading-snug text-ink-600">{note}</p>}
        </div>
      ))}
    </section>
  )
}

const DIGIT_SIZES = {
  sm: 'h-10 min-w-8 text-2xl',
  md: 'h-14 min-w-11 text-4xl',
  lg: 'h-20 min-w-[3.75rem] text-6xl sm:h-24 sm:min-w-[4.5rem] sm:text-7xl',
  xl: 'h-24 min-w-14 text-5xl sm:h-32 sm:min-w-[4.75rem] sm:text-7xl',
}

export function ScoreDigits({ value, size = 'md', tone = 'light', label }) {
  const text = String(value ?? '')
  const toneClass = tone === 'dark' ? 'border-white/30 bg-ink-950 text-white' : 'border-ink bg-white text-ink'

  return (
    <div className="flex flex-wrap gap-1" role="img" aria-label={label || text}>
      {text.split('').map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={`grid place-items-center border-2 font-display font-bold leading-none tabular-nums ${DIGIT_SIZES[size]} ${toneClass}`}
          aria-hidden="true"
        >
          {char}
        </span>
      ))}
    </div>
  )
}

const CODE_SIZES = {
  md: 'h-14 text-3xl sm:h-16 sm:text-4xl',
  lg: 'h-16 text-4xl sm:h-20 sm:text-5xl',
}

export function CodeEntry({
  value = '',
  onChange,
  length = 8,
  id = 'quiz-code',
  size = 'md',
  invalid = false,
  autoFocus = false,
  describedBy,
}) {
  const refs = useRef([])
  const chars = Array.from({ length }, (_, index) => value[index] || '')

  const write = (nextChars) => {
    onChange(nextChars.join('').slice(0, length))
  }

  const distribute = (raw, start = 0) => {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length)
    if (!cleaned) return
    const next = [...chars]
    for (let index = 0; index < cleaned.length && start + index < length; index += 1) {
      next[start + index] = cleaned[index]
    }
    write(next)
    const focusIndex = Math.min(length - 1, start + cleaned.length)
    window.requestAnimationFrame(() => refs.current[focusIndex]?.focus())
  }

  const updateAt = (index, raw) => {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!cleaned) {
      const next = [...chars]
      next[index] = ''
      write(next)
      return
    }
    if (cleaned.length > 1) {
      distribute(cleaned, index)
      return
    }
    const next = [...chars]
    next[index] = cleaned
    write(next)
    if (index < length - 1) {
      window.requestAnimationFrame(() => refs.current[index + 1]?.focus())
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !chars[index] && index > 0) {
      event.preventDefault()
      const next = [...chars]
      next[index - 1] = ''
      write(next)
      refs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  return (
    <div
      className="grid w-full gap-1.5"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      role="group"
      aria-label={`Quiz code, ${length} characters`}
    >
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element
          }}
          id={index === 0 ? id : undefined}
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          spellCheck="false"
          maxLength={1}
          value={char}
          onChange={(event) => updateAt(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => {
            event.preventDefault()
            distribute(event.clipboardData.getData('text'), index)
          }}
          onFocus={(event) => event.target.select()}
          autoFocus={autoFocus && index === 0}
          aria-label={`Character ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          aria-describedby={index === 0 ? describedBy : undefined}
          className={`${CODE_SIZES[size]} w-full min-w-0 border-2 bg-white text-center font-display font-bold uppercase leading-none tracking-normal text-ink transition focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-signal-blue focus:ring-offset-2 focus:ring-offset-white ${
            invalid ? 'border-signal-red bg-signal-red-soft' : 'border-ink'
          }`}
        />
      ))}
    </div>
  )
}

export function CopyCode({ code, onCopy, label = 'Copy code' }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex min-h-[36px] items-center gap-2 border-2 border-ink bg-white px-2.5 font-display text-sm font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-ink hover:text-white"
      aria-label={`${label} ${code}`}
    >
      <span className="tabular-nums">{code}</span>
      <Copy size={13} aria-hidden="true" />
    </button>
  )
}

export function TimeRail({ total, remaining, label = 'Time remaining' }) {
  if (!total) return null
  const safeRemaining = Math.max(0, remaining ?? total)
  const segments = 32
  const filled = Math.max(0, Math.min(segments, Math.ceil((safeRemaining / total) * segments)))
  const low = safeRemaining <= Math.max(10, total * 0.2)

  return (
    <div
      className="flex h-3 w-full gap-px border-2 border-ink bg-arena-200 p-px"
      role="img"
      aria-label={`${label}: ${safeRemaining} seconds`}
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          key={index}
          className={`h-full flex-1 ${
            index < filled ? (low ? 'bg-signal-red' : 'bg-signal-yellow') : 'bg-arena-200'
          }`}
        />
      ))}
    </div>
  )
}

export function Meter({ value = 0, tone = 'blue', className = '' }) {
  const toneClass = {
    blue: 'bg-signal-blue',
    red: 'bg-signal-red',
    yellow: 'bg-signal-yellow',
    green: 'bg-signal-green',
    ink: 'bg-ink',
  }[tone]
  const width = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={`meter ${className}`} aria-hidden="true">
      <div className={`meter-fill ${toneClass}`} style={{ width: `${width}%` }} />
    </div>
  )
}

export function CheckMark({ checked = true, className = '' }) {
  return (
    <span
      className={`grid h-5 w-5 place-items-center border-2 ${
        checked ? 'border-ink bg-signal-green text-white' : 'border-ink-400 bg-white text-transparent'
      } ${className}`}
      aria-hidden="true"
    >
      <Check size={13} strokeWidth={3} />
    </span>
  )
}
