import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import CreateTestPage from '@/pages/CreateTestPage'
import TestConfigPage from '@/pages/TestConfigPage'
import TestPage from '@/pages/TestPage'
import TestResultsPage from '@/pages/TestResultsPage'
import MyTestsPage from '@/pages/MyTestsPage'
import ProgressPage from '@/pages/ProgressPage'
import FlashCardsListPage from '@/pages/FlashCardsListPage'
import CreateFlashCardsPage from '@/pages/CreateFlashCardsPage'
import FlashCardConfigPage from '@/pages/FlashCardConfigPage'
import ManualFlashCardsPage from '@/pages/ManualFlashCardsPage'
import FlashCardViewerPage from '@/pages/FlashCardViewerPage'
import AiTutorPage from '@/pages/AiTutorPage'
import StudyGuidesListPage from '@/pages/StudyGuidesListPage'
import StudyGuideDetailPage from '@/pages/StudyGuideDetailPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Sparkles } from 'lucide-react'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const [slowServer, setSlowServer] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // If loading takes more than 3 seconds, show the "server is waking up" message
  useEffect(() => {
    if (!isLoading) {
      setSlowServer(false)
      return
    }
    const timer = setTimeout(() => setSlowServer(true), 3000)
    return () => clearTimeout(timer)
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 gap-6">
        {/* QuizWiz AI Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg" style={{ boxShadow: '0 10px 25px -5px rgba(2,132,199,0.3)' }}>
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-[28px] font-bold text-gray-900 mb-1">Quiz Wiz AI</h1>
            <p className="text-sm text-gray-500">Smart Study Made Easy</p>
          </div>
        </div>
        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" color="sky" />
          {slowServer ? (
            <>
              <p className="text-sm font-medium text-gray-700">Server is waking up...</p>
              <p className="text-xs text-gray-400">(can take up to a minute on first visit)</p>
            </>
          ) : (
            <p className="text-sm font-medium text-gray-500">Loading...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-test"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateTestPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/test-config"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TestConfigPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/test/:testId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TestPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/test-results/:resultId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TestResultsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tests"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyTestsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProgressPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FlashCardsListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-flashcards"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateFlashCardsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/flashcard-config"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FlashCardConfigPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/flashcards/manual"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ManualFlashCardsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/flashcards/:deckId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FlashCardViewerPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tutor"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AiTutorPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/homework"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AiTutorPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-guide"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StudyGuidesListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-guide/:resultId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StudyGuideDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home or login */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
    </Routes>
  )
}

export default App
