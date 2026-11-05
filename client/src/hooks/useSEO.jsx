import { useEffect } from 'react'

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://quiz-mania.vercel.app').replace(/\/+$/, '')

const ROUTES = {
  '/': {
    title: 'Quiz Mania — Create, share and play free quizzes',
    description:
      'Build a quiz in minutes, share an 8-character code, and let anyone play and get scored instantly. Free, fast and mobile-friendly.',
  },
  '/login': {
    title: 'Log in — Quiz Mania',
    description: 'Sign in to create quizzes, play with a code and track your results on Quiz Mania.',
  },
  '/register': {
    title: 'Create a free account — Quiz Mania',
    description: 'Join Quiz Mania free to build quizzes, share them with a code and keep your scores in one place.',
  },
  '/dashboard': {
    title: 'Your dashboard — Quiz Mania',
    description: 'Manage your quizzes, publish drafts and review how people scored.',
  },
  '/quiz/create': {
    title: 'Create a quiz — Quiz Mania',
    description:
      'Build multiple-choice, true/false and multi-select questions, set a timer and publish a shareable quiz.',
  },
  '/quiz/join': {
    title: 'Join a quiz with a code — Quiz Mania',
    description: 'Enter the 8-character code from your host and start playing instantly.',
  },
  '/quiz/play': {
    title: 'Play a quiz — Quiz Mania',
    description: 'Answer questions, beat the timer and see your score instantly.',
  },
  '/quiz/results': {
    title: 'Quiz results — Quiz Mania',
    description: 'Review attempts, scores and performance for a quiz you created.',
  },
  '/my-results': {
    title: 'My results — Quiz Mania',
    description: 'Track your quiz scores, accuracy and progress over time.',
  },
}

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}

export default function useSEO(route) {
  const config = typeof route === 'string' ? ROUTES[route] : route
  const title = config?.title
  const description = config?.description
  const path = config?.path || (typeof route === 'string' ? route : '/')
  const image = config?.image || `${SITE_URL}/og-image.png`

  useEffect(() => {
    if (!title) return

    const url = `${SITE_URL}${path === '/' ? '/' : path}`

    document.title = title
    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, path, image])
}
