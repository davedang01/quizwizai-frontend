import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'
import { Test } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ScoreCircle from '@/components/common/ScoreCircle'
import { toast } from 'sonner'

export default function MyTestsPage() {
  const navigate = useNavigate()
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/tests')
        setTests(response.data.tests || [])
      } catch (error) {
        toast.error('Failed to load tests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTests()
  }, [])

  const handleDelete = async (testId: string) => {
    try {
      await api.delete(`/tests/${testId}`)
      setTests(tests.filter((t) => t.id !== testId))
      setDeleteConfirm(null)
      toast.success('Test deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete test')
    }
  }

  const handleTestClick = (test: Test) => {
    if (test.is_completed) {
      navigate(`/test-results/${test.id}`)
    } else {
      navigate(`/test/${test.id}`)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'hard':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="purple" />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Tests</h1>
          <p className="text-gray-600 mt-1">
            You have {tests.length} test{tests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/create-test')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-pink text-white font-semibold hover:shadow-lg transition-all w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          New Test
        </motion.button>
      </motion.div>

      {/* Tests Grid */}
      {tests.length === 0 ? (
        <motion.div
          className="card p-12 text-center"
          variants={itemVariants}
        >
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No tests yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first test to get started with Quiz Wiz AI!
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create-test')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-purple-pink text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Test
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {tests.map((test) => (
            <motion.div
              key={test.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="card cursor-pointer overflow-hidden transition-all"
              onClick={() => handleTestClick(test)}
            >
              <div className="p-6">
                {/* Test Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {test.test_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(test.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {test.is_completed && test.score !== null && (
                    <ScoreCircle
                      percentage={test.score}
                      size="sm"
                      showLabel={false}
                    />
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {test.test_type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    {test.total_questions} questions
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {test.is_completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 text-green-600"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Completed</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">In Progress</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 h-0" />

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(test.id)
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete test"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600">
                  {test.is_completed
                    ? 'View results'
                    : 'Continue test'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 max-w-sm"
            >
              <h2 className="text-xl font-bold mb-2 text-gray-900">
                Delete Test?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this test? This action cannot be
                undone.
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
