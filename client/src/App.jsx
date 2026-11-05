import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Spinner } from './components/ui'
import useAuthStore from './store/authStore'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateQuiz from './pages/CreateQuiz'
import EditQuiz from './pages/EditQuiz'
import JoinQuiz from './pages/JoinQuiz'
import PlayQuiz from './pages/PlayQuiz'
import QuizResults from './pages/QuizResults'
import MyResults from './pages/MyResults'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AuthEventListener() {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  useEffect(() => {
    const handler = () => clearAuth()
    window.addEventListener('quizmania:logout', handler)
    return () => window.removeEventListener('quizmania:logout', handler)
  }, [clearAuth])
  return null
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <Spinner fullPage label="Checking your session…" />
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: window.location.pathname }} />
}

function AppLayout() {
  const { checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <AuthEventListener />
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-secondary-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-950"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div id="main-content" className="flex-1">
          {isLoading ? (
            <Spinner fullPage label="Warming up…" />
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/quiz/join" element={<JoinQuiz />} />
              <Route path="/quiz/play/:code" element={<PlayQuiz />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/create"
                element={
                  <ProtectedRoute>
                    <CreateQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/results/:id"
                element={
                  <ProtectedRoute>
                    <QuizResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-results"
                element={
                  <ProtectedRoute>
                    <MyResults />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </div>
        <Footer />
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
