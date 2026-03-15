import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'
import { ProgressStats } from '@/types'
import ScoreCircle from '@/components/common/ScoreCircle'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function StudyGuidesListPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/progress/stats')
        setStats(response.data)
      } catch (error) {
        toast.error('Failed to load study materials')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="sky" />
      </div>
    )
  }

  const completedTests = stats?.recent_results || []

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial={false}
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">Study Guide</h1>
        <p className="text-gray-600">
          Review your test results and learn from mistakes
        </p>
      </motion.div>

      {/* Results Grid */}
      {completedTests.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {completedTests.map((result, idx) => (
            <motion.div
              key={result.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="card p-6"
            >
              <div className="flex items-start gap-6">
                {/* Score Circle */}
                <div className="flex-shrink-0">
                  <ScoreCircle percentage={result.percentage} size="sm" showLabel={false} />
                </div>

                {/* Test Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {result.test_name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(result.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>

                  <div className="flex gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Correct</p>
                      <p className="font-bold text-green-600">
                        {result.correct_answers.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Incorrect</p>
                      <p className="font-bold text-red-600">
                        {result.wrong_answers.length}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/study-guide/${result.id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg transition-all"
                  >
                    <span>Study</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          className="card p-12 text-center"
          variants={itemVariants}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-sky-600" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No study guides yet
          </h2>
          <p className="text-gray-600 mb-6">
            Complete some tests first to create study guides from your results
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/create-test')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg transition-all"
          >
            <BookOpen className="w-5 h-5" />
            Create your first test
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}
