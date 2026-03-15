import { useEffect } from 'react'
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
import LoadingSpinner from '@/components/common/LoadingSpinner'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" color="sky" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

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
