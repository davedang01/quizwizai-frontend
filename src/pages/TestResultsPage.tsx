import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RotateCcw,
  Plus,
  Home,
  BookOpen,
  Trophy,
  CheckCircle2,
  XCircle,
  Copy,
  ArrowRight,
  RefreshCw,
  GraduationCap,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import { TestResult, StudyGuide } from '@/types'
import ScoreCircle from '@/components/common/ScoreCircle'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { toast } from 'sonner'
import { formatMathContent } from '@/utils/formatMath'

export default function TestResultsPage() {
  const { resultId } = useParams<{ resultId: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<TestResult | null>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isResettingTest, setIsResettingTest] = useState(false)
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false)
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null)
  const [showStudyGuide, setShowStudyGuide] = useState(false)

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) return
      try {
        const response = await api.get(`/tests/results/${resultId}`)
        setResult(response.data)
        // Fetch the test to get scan_id for "Create Another Version"
        if (response.data.test_id) {
          try {
            const testResp = await api.get(`/tests/${response.data.test_id}`)
            setScanId(testResp.data.scan_id || null)
          } catch {
            // Non-critical — Create Another Version will just go to fresh upload
          }
        }
      } catch (error) {
        toast.error('Failed to load test results')
        navigate('/tests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResult()
  }, [resultId, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="sky" />
      </div>
    )
  }

  if (!result) {
    return null
  }

  const handleRetakeTest = async () => {
    if (!result) return
    try {
      setIsResettingTest(true)
      await api.post(`/tests/${result.test_id}/reset`)
      navigate(`/test/${result.test_id}`)
      toast.success('Test reset successfully!')
    } catch (error) {
      toast.error('Failed to reset test')
    } finally {
      setIsResettingTest(false)
    }
  }

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 80) {
      return {
        title: 'Excellent!',
        subtitle: 'You aced this test! Keep up the great work.',
        color: 'text-green-600',
      }
    }
    if (percentage >= 60) {
      return {
        title: 'Good Job!',
        subtitle: 'You did well! Review the questions you missed.',
        color: 'text-blue-600',
      }
    }
    if (percentage >= 50) {
      return {
        title: 'Keep Practicing!',
        subtitle: 'You need more practice on this topic.',
        color: 'text-yellow-600',
      }
    }
    return {
      title: 'Need More Practice',
      subtitle: 'Focus on understanding the material better.',
      color: 'text-red-600',
    }
  }

  const performance = getPerformanceMessage(result.percentage)

  const getTrophyIcon = (percentage: number) => {
    if (percentage >= 80) return '🏆'
    if (percentage >= 60) return '🥈'
    if (percentage >= 50) return '🎖️'
    return '📚'
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
      initial={false}
      animate="visible"
    >
      {/* Results Header */}
      <motion.div className="text-center" variants={itemVariants}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block text-6xl mb-4"
        >
          {getTrophyIcon(result.percentage)}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-4xl font-bold mb-2 ${performance.color}`}
        >
          {performance.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-lg"
        >
          {performance.subtitle}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-sky-600 mt-4"
        >
          {result.test_name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600"
        >
          {new Date(result.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </motion.p>
      </motion.div>

      {/* Score Circle */}
      <motion.div
        className="flex justify-center"
        variants={itemVariants}
      >
        <ScoreCircle percentage={result.percentage} size="lg" />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {/* Score Percentage */}
        <motion.div
          whileHover={{ y: -5 }}
          className="card p-6 text-center"
          variants={itemVariants}
        >
          <div className="text-sm text-gray-600 mb-2">Final Score</div>
          <div className="text-4xl font-bold text-sky-600">
            {result.percentage}%
          </div>
        </motion.div>

        {/* Correct Answers */}
        <motion.div
          whileHover={{ y: -5 }}
          className="card p-6 text-center"
          variants={itemVariants}
        >
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-sm text-gray-600 mb-2">Correct Answers</div>
          <div className="text-4xl font-bold text-green-600">
            {result.correct_answers.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            out of {result.total_questions}
          </div>
        </motion.div>

        {/* Incorrect Answers */}
        <motion.div
          whileHover={{ y: -5 }}
          className="card p-6 text-center"
          variants={itemVariants}
        >
          <div className="flex justify-center mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-sm text-gray-600 mb-2">Incorrect Answers</div>
          <div className="text-4xl font-bold text-red-600">
            {result.wrong_answers.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {result.wrong_answers.length === 0
              ? 'Perfect score!'
              : `${((result.wrong_answers.length / result.total_questions) * 100).toFixed(0)}% error rate`}
          </div>
        </motion.div>
      </motion.div>

      {/* Full Test Review */}
      {result.wrong_answers.length > 0 && (
        <motion.div className="card p-8" variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-orange-500" />
            Review Your Mistakes
          </h2>

          <motion.div
            className="space-y-6"
            variants={containerVariants}
          >
            {result.wrong_answers.map((wrong, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="border-l-4 border-red-500 pl-6 py-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold mr-3">
                      Q{idx + 1}
                    </span>
                    {formatMathContent(wrong.question || '')}
                  </h3>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Your answer:
                    </p>
                    <p className="text-sm text-red-600 font-semibold">
                      {formatMathContent(wrong.user_answer || '')}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-sm font-medium text-gray-700">
                      Correct answer:
                    </p>
                    <p className="text-sm text-green-600 font-semibold">
                      {formatMathContent(wrong.correct_answer || '')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Study Guide Section */}
      {result.wrong_answers.length > 0 && (
        <motion.div className="card p-8" variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-500" />
              Study Guide
            </h2>
            {!studyGuide && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  try {
                    setIsGeneratingGuide(true)
                    // Check if one already exists
                    const existing = await api.get(`/study-guides/result/${resultId}`)
                    if (existing.data.exists && existing.data.id) {
                      const guideResp = await api.get(`/study-guides/${existing.data.id}`)
                      setStudyGuide(guideResp.data)
                      setShowStudyGuide(true)
                    } else {
                      const resp = await api.post('/study-guides/generate', { result_id: resultId })
                      setStudyGuide(resp.data)
                      setShowStudyGuide(true)
                    }
                  } catch (error) {
                    toast.error('Failed to generate study guide')
                  } finally {
                    setIsGeneratingGuide(false)
                  }
                }}
                disabled={isGeneratingGuide}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isGeneratingGuide ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Generate Study Guide
                  </>
                )}
              </motion.button>
            )}
            {studyGuide && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStudyGuide(!showStudyGuide)}
                className="text-sm text-purple-600 font-medium"
              >
                {showStudyGuide ? 'Hide' : 'Show'}
              </motion.button>
            )}
          </div>

          {!studyGuide && !isGeneratingGuide && (
            <p className="text-gray-500 text-sm">
              Get personalized explanations, tips, and practice questions for the ones you missed.
            </p>
          )}

          {showStudyGuide && studyGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6 mt-4"
            >
              {studyGuide.guides.map((guide, gIdx) => (
                <div key={gIdx} className="border rounded-xl overflow-hidden">
                  {/* Question header */}
                  <div className="bg-purple-50 px-5 py-3 border-b border-purple-100">
                    <p className="font-semibold text-gray-900">
                      {formatMathContent(guide.question || '')}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="text-red-500">Your answer: {formatMathContent(guide.user_answer || '')}</span>
                      <span className="text-green-600">Correct: {formatMathContent(guide.correct_answer || '')}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Explanation */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-blue-700 mb-1">Explanation</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {formatMathContent(guide.explanation || '')}
                      </p>
                    </div>

                    {/* Tips */}
                    {guide.tips && (
                      <div className="bg-amber-50 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-amber-700 mb-1">Study Tips</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {formatMathContent(guide.tips)}
                        </p>
                      </div>
                    )}

                    {/* Practice question */}
                    {guide.practice_question && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-green-700 mb-1">Practice Question</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {formatMathContent(guide.practice_question)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        className="space-y-3"
        variants={itemVariants}
      >
        {/* Create Another Version Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(scanId ? `/test-config?scan_id=${scanId}` : '/create-test')}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gradient-coral text-white font-semibold hover:shadow-lg transition-all"
        >
          <Copy className="w-5 h-5" />
          Create Another Version
        </motion.button>

        {/* Re-take Test Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRetakeTest}
          disabled={isResettingTest}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-sky-500 text-sky-600 font-semibold hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isResettingTest ? (
            <>
              <span className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Re-take Test
            </>
          )}
        </motion.button>

        {/* Done Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/tests')}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          Done
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
