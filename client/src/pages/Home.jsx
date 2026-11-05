import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gamepad2,
  Layers,
  ListChecks,
  PlusCircle,
  Share2,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import useSEO from '../hooks/useSEO'

const steps = [
  {
    icon: PlusCircle,
    title: 'Build your quiz',
    body: 'Add multiple-choice, true/false or multi-select questions. Set points, an optional timer and an explanation for each answer.',
  },
  {
    icon: Share2,
    title: 'Share one code',
    body: 'Publish to get an 8-character code. Send it to a class, a group chat or a friend — no links to shorten.',
  },
  {
    icon: Trophy,
    title: 'Play and get scored',
    body: 'Players answer against the clock, submit once and see their score immediately. You see every attempt in your dashboard.',
  },
]

const features = [
  {
    icon: Layers,
    title: 'Three question types',
    body: 'Multiple choice, true/false and multi-select, with 2–6 options and per-question points.',
  },
  {
    icon: Clock3,
    title: 'Optional timer',
    body: 'Add a countdown when speed matters, or leave it off for relaxed practice.',
  },
  {
    icon: ListChecks,
    title: 'Draft, publish, retake',
    body: 'Save drafts while you build, publish when ready, and decide whether retakes are allowed.',
  },
  {
    icon: BarChart3,
    title: 'Results you can use',
    body: 'See attempts, scores, accuracy and time taken. Personal history lives in My Results.',
  },
  {
    icon: Sparkles,
    title: 'Explanations included',
    body: 'Add a short explanation to any question so players learn from the answer.',
  },
  {
    icon: Users,
    title: 'Made for two sides',
    body: 'Creators get a builder and analytics. Players get a fast, focused play screen.',
  },
]

const categories = [
  'General knowledge',
  'Science',
  'Mathematics',
  'History',
  'Geography',
  'Technology',
  'Sports',
  'Entertainment',
]

export default function Home() {
  useSEO('/')

  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="container-page relative pt-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">
              <Zap size={14} aria-hidden="true" /> Free public quiz platform
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] sm:text-6xl">
              Quiz night,
              <br />
              <span className="bg-gradient-to-r from-secondary-300 via-accent-pink to-primary-300 bg-clip-text text-transparent">
                any night.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Build a quiz in minutes, share one 8-character code, and let anyone play and get scored
              instantly. Free to use, right in the browser.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/quiz/join" className="btn-primary text-base">
                <Gamepad2 size={20} aria-hidden="true" /> Join a quiz
              </Link>
              <Link to="/quiz/create" className="btn-secondary text-base">
                <PlusCircle size={20} aria-hidden="true" /> Create a quiz
              </Link>
            </div>

            <ul className="mt-7 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
              {['No download needed', 'Works on phone and desktop', 'Free account to host', 'Scores saved to your history'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-accent-teal" aria-hidden="true" /> {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Playful mock card */}
          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-primary-500/20 blur-3xl" />
            <div className="surface relative overflow-hidden p-6 animate-float">
              <div className="flex items-center justify-between">
                <span className="badge bg-secondary-400/15 text-secondary-200">
                  <Zap size={13} /> Live quiz
                </span>
                <span className="font-mono text-xs text-slate-400">Q 3 / 8</span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-primary-400 to-accent-pink" />
              </div>

              <h2 className="mt-5 text-xl font-bold">Which planet has the most moons?</h2>
              <div className="mt-4 space-y-2.5">
                {[
                  ['Saturn', true],
                  ['Mars', false],
                  ['Venus', false],
                  ['Mercury', false],
                ].map(([label, selected]) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                      selected
                        ? 'border-primary-400/60 bg-primary-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border ${
                        selected ? 'border-primary-300 bg-primary-400' : 'border-slate-500'
                      }`}
                    >
                      {selected && <CheckCircle2 size={13} className="text-ink-950" />}
                    </span>
                    {label}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-ink-950/50 px-4 py-3">
                <span className="text-sm text-slate-400">Time left</span>
                <span className="font-mono text-lg font-bold text-secondary-300">00:24</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page mt-24" aria-labelledby="how-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 id="how-heading" className="section-title mt-3">
            From blank page to playable in three steps
          </h2>
        </div>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="surface relative p-6">
              <span className="absolute right-5 top-4 font-display text-4xl font-black text-white/10">{index + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-500/15 text-primary-300">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="container-page mt-24" aria-labelledby="features-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">What is inside</p>
            <h2 id="features-heading" className="section-title mt-3">
              Real tools, not filler
            </h2>
            <p className="mt-3 text-slate-400">
              Everything here is part of the product today — no roadmap promises.
            </p>
          </div>
          <Link to="/register" className="btn-secondary shrink-0">
            Start free <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="card-grid mt-8">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="surface p-6 transition hover:border-white/20 hover:bg-white/[0.07]">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.06] text-secondary-300">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-24" aria-labelledby="categories-heading">
        <div className="surface flex flex-col gap-6 p-7 sm:p-9 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="categories-heading" className="text-2xl font-bold">
              A place for every kind of quiz
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Pick a category when you create, so players know what they are getting into.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category} className="badge border border-white/10 bg-white/[0.05] text-slate-300">
                {category}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary-600/60 via-indigo-700/40 to-accent-pink/25 p-8 text-center sm:p-14">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-secondary-400/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-primary-300/20 blur-3xl" aria-hidden="true" />
          <h2 className="relative text-3xl font-black sm:text-4xl">Got five minutes? Make a quiz.</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-50/90">
            Create an account free, publish your first quiz, and share the code with anyone you like.
          </p>
          <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary text-base">
              <PlusCircle size={19} aria-hidden="true" /> Create free account
            </Link>
            <Link to="/quiz/join" className="btn-secondary text-base">
              <Gamepad2 size={19} aria-hidden="true" /> I have a code
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
