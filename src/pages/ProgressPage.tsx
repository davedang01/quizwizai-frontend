import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Flame,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import { ProgressStats } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ScoreCircle from '@/components/common/ScoreCircle'
import { toast } from 'sonner'

export default function ProgressPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/progress/stats')
        setStats(response.data)
      } catch (error) {
        toast.error('Failed to load progress stats')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="sky" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

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

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full mb-4">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-semibold text-sky-600">
            Your Learning Journey
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
        <p className="text-gray-600">
          Track your learning journey and celebrate your achievements
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {/* Total Tests */}
        <motion.div
          whileHover={{ y: -5 }}
          className="card p-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-sky-600" />
            </div>
            <p className="text-gray-600 text-sm">Total Tests</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.total_tests}</p>
        </motion.div>

        {/* Average Score */}
        <motion.div
          whileHover={{ y: -5 }}
          className="card p-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
            <p className="text-gray-600 text-sm">Avg Score</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {Math.round(stats.avg_score)}%
          </p>
        </motion.div>

        {/* Total Scans */}
        <motion.div
          whileHover={{ y: -5 }}
          className="card p-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-gray-600 text-sm">Scans</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.total_scans}</p>
        </motion.div>

        {/* Streak */}
        <motion.div
          whileHover={{ y: -5 }}
          className="card p-6 bg-gradient-to-br from-orange-50 to-red-50"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-gray-600 text-sm">Day Streak</p>
          </div>
          <p className="text-4xl font-bold text-orange-600">
            {stats.streak_days}
          </p>
        </motion.div>
      </motion.div>

      {/* Achievements Section */}
      {stats.badges && stats.badges.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Your Achievements</h2>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={containerVariants}
          >
            {stats.badges.map((badge) => (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                whileHover={badge.earned ? { scale: 1.05 } : {}}
                className={`card p-6 text-center transition-all ${
                  badge.earned
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 shadow-md'
                    : 'opacity-40 grayscale'
                }`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-5xl mb-3"
                >
                  {badge.icon}
                </motion.div>
                <h3 className="font-bold text-sm mb-1 text-gray-900">
                  {badge.name}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  {badge.description}
                </p>
                {badge.earned_at && (
                  <p className="text-xs text-gray-500">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Recent Results Section */}
      {stats.recent_results && stats.recent_results.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Test History</h2>
            <button
              onClick={() => navigate('/tests')}
              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <motion.div
            className="card overflow-hidden"
            variants={itemVariants}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Correct
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recent_results.slice(0, 10).map((result) => (
                    <motion.tr
                      key={result.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => navigate(`/test-results/${result.id}`)}
                      className="cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {result.test_name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(result.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <ScoreCircle
                          percentage={result.percentage}
                          size="sm"
                          showLabel={false}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                          {result.correct_answers.length}/{result.total_questions}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Empty State */}
      {stats.recent_results.length === 0 && (
        <motion.div className="card p-12 text-center" variants={itemVariants}>
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No test results yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start taking tests to track your progress and see your growth!
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create-test')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            Create Test
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}
