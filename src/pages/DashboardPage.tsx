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
  BookOpen,
  BarChart2,
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

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* ── Hero ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 p-6 lg:p-8 text-white"
      >
        {/* decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />

        <div className="relative z-10 lg:flex lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full mb-3 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Your Learning Hub</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">Welcome to Quiz Wiz AI!</h1>
            <p className="text-sm text-white/90 lg:text-base">
              Turn any study material into personalized quizzes and flash cards.
            </p>
            {stats && stats.streak_days > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full mt-3"
              >
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-semibold">{stats.streak_days} day streak!</span>
              </motion.div>
            )}
          </div>

          {/* Desktop: stat summary inline with hero */}
          {stats && (
            <div className="hidden lg:grid grid-cols-3 gap-4 mt-0 ml-8">
              {[
                { label: 'Tests Done', value: stats.total_tests, icon: CheckCircle2 },
                { label: 'Avg Score', value: `${Math.round(stats.avg_score)}%`, icon: TrendingUp },
                { label: 'Scans', value: stats.total_scans, icon: FileText },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/20 backdrop-blur rounded-xl p-4 text-center min-w-[90px]">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-white/80" />
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-white/80">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Desktop two-column layout ── */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">

        {/* Left column: Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-base font-semibold text-gray-700 hidden lg:block">Quick Actions</h2>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create-test')}
            className="w-full rounded-xl p-4 text-white hover:shadow-lg transition-shadow flex items-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-500"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Create New Test</p>
              <p className="text-xs text-white/80">Upload material, generate quiz</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create-flashcards')}
            className="w-full rounded-xl p-4 text-white hover:shadow-lg transition-shadow flex items-center gap-3 bg-gradient-to-r from-orange-400 to-rose-400"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Create Flash Cards</p>
              <p className="text-xs text-white/80">Study with spaced repetition</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tutor')}
            className="w-full rounded-xl p-4 text-white hover:shadow-lg transition-shadow flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-400"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">My AI Tutor</p>
              <p className="text-xs text-white/80">Ask questions, get explanations</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/study-guide')}
            className="w-full rounded-xl p-4 text-white hover:shadow-lg transition-shadow flex items-center gap-3 bg-gradient-to-r from-violet-500 to-purple-400"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Study Guides</p>
              <p className="text-xs text-white/80">AI-generated study notes</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
          </motion.button>
        </div>

        {/* Right column: Stats + Recent Results */}
        <div className="lg:col-span-2 space-y-6">

          {/* Mobile-only stat cards */}
          {stats && (
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 lg:hidden">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <CheckCircle2 className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.total_tests}</p>
                <p className="text-xs text-gray-500">Tests Done</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avg_score)}%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <FileText className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.total_scans}</p>
                <p className="text-xs text-gray-500">Scans</p>
              </div>
            </motion.div>
          )}

          {/* Achievements */}
          {stats?.badges && stats.badges.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                Achievements
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm ${
                      badge.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="font-semibold text-xs text-gray-800">{badge.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{badge.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Results */}
          {stats?.recent_results && stats.recent_results.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-sky-500" />
                  Recent Results
                </h2>
                <button
                  onClick={() => navigate('/tests')}
                  className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold text-sm"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop: table-style list */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {stats.recent_results.slice(0, 6).map((result, idx) => (
                  <div
                    key={result.id}
                    onClick={() => navigate(`/test-results/${result.id}`)}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-sky-50 transition-colors ${
                      idx !== 0 ? 'border-t border-gray-100' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{result.test_name}</p>
                      <p className="text-xs text-gray-500">{result.correct_answers.length}/{result.total_questions} correct</p>
                    </div>
                    <ScoreCircle percentage={result.percentage} size="sm" showLabel={false} />
                    <span
                      className={`hidden lg:block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        result.percentage >= 80
                          ? 'bg-emerald-100 text-emerald-700'
                          : result.percentage >= 60
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {result.percentage >= 80 ? 'Great' : result.percentage >= 60 ? 'Good' : 'Review'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {(!stats?.recent_results || stats.recent_results.length === 0) && (
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
              <Sparkles className="w-10 h-10 text-sky-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">No tests yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first test to get started</p>
              <button
                onClick={() => navigate('/create-test')}
                className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors"
              >
                Create a Test
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
