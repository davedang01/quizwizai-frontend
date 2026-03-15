import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap,
  Plus,
  Sparkles,
  CheckCircle2,
  Flame,
  FileText,
  TrendingUp,
  Award,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import { ProgressStats, TestResult, Badge } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ScoreCircle from '@/components/common/ScoreCircle'
import { toast } from 'sonner'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/progress/stats')
        setStats(response.data)
      } catch (error) {
        toast.error('Failed to load dashboard stats')
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
      {/* Hero Section */}
      <motion.div
        className="card-gradient bg-gradient-purple-pink rounded-2xl p-8 text-white overflow-hidden relative"
        variants={itemVariants}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-4 w-fit">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Your Learning Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome to Quiz Wiz AI!</h1>
          <p className="text-lg text-white/90 mb-6">
            Turn any study material into personalized quizzes
          </p>
          {stats && stats.streak_days > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full"
            >
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="font-semibold">{stats.streak_days} day streak!</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/create-test')}
          className="card p-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors"
        >
          <Plus className="w-8 h-8 mb-3 mx-auto" />
          <p className="font-semibold text-center">Create New Test</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/create-test')}
          className="card-gradient bg-gradient-pink rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Zap className="w-8 h-8 mb-3 mx-auto" />
          <p className="font-semibold text-center">Create Flash Cards</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/tutor')}
          className="card-gradient bg-gradient-teal-cyan rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <MessageCircle className="w-8 h-8 mb-3 mx-auto" />
          <p className="font-semibold text-center">My AI Tutor</p>
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={itemVariants}
          >
            {/* Tests Completed */}
            <motion.div
              whileHover={{ y: -5 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Tests Completed</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {stats.total_tests}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            {/* Average Score */}
            <motion.div
              whileHover={{ y: -5 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Average Score</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {Math.round(stats.avg_score)}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </motion.div>

            {/* Photos Scanned */}
            <motion.div
              whileHover={{ y: -5 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Photos Scanned</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {stats.total_scans}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Achievements */}
          {stats.badges && stats.badges.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Your Achievements
              </h2>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={containerVariants}
              >
                {stats.badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    variants={itemVariants}
                    className={`card p-4 text-center ${
                      badge.earned
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-sm mb-1">{badge.name}</p>
                    <p className="text-xs text-gray-600">{badge.description}</p>
                    {badge.earned_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Recent Results */}
          {stats.recent_results && stats.recent_results.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Results</h2>
                <button
                  onClick={() => navigate('/tests')}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <motion.div
                className="space-y-3"
                variants={containerVariants}
              >
                {stats.recent_results.slice(0, 5).map((result) => (
                  <motion.div
                    key={result.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/test-results/${result.id}`)}
                    className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {result.test_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {result.correct_answers.length}/{result.total_questions} correct
                        </p>
                      </div>
                      <ScoreCircle
                        percentage={result.percentage}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
