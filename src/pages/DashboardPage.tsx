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
        <LoadingSpinner size="lg" color="sky" />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        className="card-gradient bg-gradient-primary rounded-2xl p-6 text-white overflow-hidden relative"
        variants={itemVariants}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full mb-3 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Your Learning Hub</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">Welcome to Quiz Wiz AI!</h1>
          <p className="text-sm text-white/90 mb-4">
            Turn any study material into personalized quizzes
          </p>
          {stats && stats.streak_days > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full"
            >
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-sm font-semibold">{stats.streak_days} day streak!</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="space-y-3" variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/create-test')}
          className="w-full card-gradient bg-gradient-sky-indigo rounded-xl p-4 text-white hover:shadow-lg transition-shadow flex items-center gap-3"
        >
          <Plus className="w-6 h-6" />
          <span className="font-semibold">Create New Test</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/create-flashcards')}
          className="w-full card-gradient bg-gradient-coral rounded-xl p-4 text-white hover:shadow-lg transition-shadow flex items-center gap-3"
        >
          <Zap className="w-6 h-6" />
          <span className="font-semibold">Create Flash Cards</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/tutor')}
          className="w-full card-gradient bg-gradient-teal-cyan rounded-xl p-4 text-white hover:shadow-lg transition-shadow flex items-center gap-3"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-semibold">My AI Tutor</span>
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <>
          <motion.div
            className="grid grid-cols-1 gap-4"
            variants={itemVariants}
          >
            {/* Tests Completed */}
            <motion.div
              whileHover={{ y: -3 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Tests Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_tests}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-sky-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-sky-600" />
                </div>
              </div>
            </motion.div>

            {/* Average Score */}
            <motion.div
              whileHover={{ y: -3 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(stats.avg_score)}%
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </motion.div>

            {/* Photos Scanned */}
            <motion.div
              whileHover={{ y: -3 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Photos Scanned</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_scans}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-teal-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Achievements */}
          {stats.badges && stats.badges.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Your Achievements
              </h2>
              <motion.div
                className="grid grid-cols-2 gap-3"
                variants={containerVariants}
              >
                {stats.badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    variants={itemVariants}
                    className={`card p-3 text-center ${
                      badge.earned
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <p className="font-semibold text-xs mb-0.5">{badge.name}</p>
                    <p className="text-[10px] text-gray-600">{badge.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Recent Results */}
          {stats.recent_results && stats.recent_results.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">Recent Results</h2>
                <button
                  onClick={() => navigate('/tests')}
                  className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold text-sm"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <motion.div
                className="space-y-2"
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
                        <p className="font-semibold text-gray-900 text-sm">
                          {result.test_name}
                        </p>
                        <p className="text-xs text-gray-600">
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
