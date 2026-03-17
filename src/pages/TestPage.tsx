import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, Copy, ArrowRight, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'
import { Test, Question } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { toast } from 'sonner'
import { formatMathContent } from '@/utils/formatMath'

interface UserAnswers {
  [questionId: string]: string
}

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({})
  const [showReview, setShowReview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResettingTest, setIsResettingTest] = useState(false)

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return
      try {
        const response = await api.get(`/tests/${testId}`)
        setTest(response.data)
      } catch (error: any) {
        toast.error('Failed to load test')
        navigate('/tests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTest()
  }, [testId, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="sky" />
      </div>
    )
  }

  if (!test) {
    return null
  }

  if (!test.questions || test.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No questions generated</h2>
        <p className="text-gray-600 mb-4">The AI was unable to generate questions. Please try again.</p>
        <button
          onClick={() => navigate('/create-test')}
          className="px-6 py-3 bg-sky-500 text-white rounded-lg font-semibold"
        >
          Try Again
        </button>
      </div>
    )
  }

  const handleRetakeTest = async () => {
    if (!testId) return
    try {
      setIsResettingTest(true)
      await api.post(`/tests/${testId}/reset`)
      navigate(`/test/${testId}`)
      toast.success('Test reset successfully!')
    } catch (error) {
      toast.error('Failed to reset test')
    } finally {
      setIsResettingTest(false)
    }
  }

  // If test is already completed, show CTAs instead of test interface
  if (test.is_completed) {
    return (
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {test.test_name}
          </h1>
          <p className="text-gray-600 text-lg">
            This test has already been completed
          </p>
          {test.score !== null && (
            <p className="text-2xl font-bold text-sky-600 mt-4">
              Your Score: {test.score}%
            </p>
          )}
        </div>

        {/* CTAs */}
        <motion.div className="space-y-3 max-w-md mx-auto w-full">
          {/* Create Another Version Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(test.scan_id ? `/test-config?scan_id=${test.scan_id}` : '/create-test')}
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

  const currentQuestion = test.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1
  const answeredCount = Object.keys(userAnswers).length

  const handleAnswerChange = (answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answer,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      // Convert { questionId: answer } dict to list format backend expects
      const answersList = Object.entries(userAnswers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }))
      const payload = {
        test_id: testId,
        answers: answersList,
      }
      const response = await api.post('/tests/submit', payload)
      navigate(`/test-results/${response.data.id}`)
      toast.success('Test submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit test')
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  }

  const questionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial={false}
      animate="visible"
    >
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{test.test_name}</h1>
            <p className="text-gray-600 text-sm mt-1">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              Answered: {answeredCount}/{test.questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>

      {/* Question Pills Navigation */}
      <motion.div className="flex flex-wrap gap-2">
        {test.questions.map((q, idx) => (
          <motion.button
            key={q.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={`px-3 py-2 rounded-lg font-medium transition-all ${
              idx === currentQuestionIndex
                ? 'bg-gradient-primary text-white shadow-md'
                : userAnswers[q.id]
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {idx + 1}
          </motion.button>
        ))}
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          className="card p-8"
          variants={questionVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Question Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-block px-4 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold">
                Question {currentQuestionIndex + 1}
              </div>
              {currentQuestion.type && (
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium capitalize">
                  {currentQuestion.type.replace(/_/g, ' ').replace(/-/g, ' ')}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 whitespace-pre-wrap">
              {formatMathContent((currentQuestion as any).text || currentQuestion.question || '')}
            </h2>
          </motion.div>

          {/* Answer Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-8"
          >
            {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'multiple_choice') &&
              currentQuestion.options ? (
              currentQuestion.options.map((option, idx) => (
                <motion.label
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-sky-500 hover:bg-sky-50"
                  style={{
                    borderColor:
                      userAnswers[currentQuestion.id] === option
                        ? '#7c3aed'
                        : '#e5e7eb',
                    backgroundColor:
                      userAnswers[currentQuestion.id] === option
                        ? '#f3e8ff'
                        : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={userAnswers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="ml-4 text-lg text-gray-900 font-medium">
                    {formatMathContent(option)}
                  </span>
                </motion.label>
              ))
            ) : currentQuestion.type === 'word_problem' || currentQuestion.type === 'word-problem' ? (
              <div>
                <textarea
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-sky-400 focus:outline-none resize-none"
                  placeholder="Show your work and write your answer here..."
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">Tip: Show your reasoning for best results</p>
              </div>
            ) : currentQuestion.type === 'math' || currentQuestion.type === 'math-problem' ? (
              <div>
                <input
                  type="text"
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="input-primary text-lg"
                  placeholder="Enter your numerical answer (e.g. 42, 3/4, 2.5)"
                />
                <p className="text-xs text-gray-400 mt-1">Tip: Use fractions (1/2), decimals (0.5), or mixed numbers (2 3/4)</p>
              </div>
            ) : (
              <input
                type="text"
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="input-primary text-lg"
                placeholder="Type your answer here..."
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={isLastQuestion}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-teal-cyan text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {isLastQuestion && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReview(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg transition-all"
          >
            <Eye className="w-5 h-5" />
            Review & Submit
          </motion.button>
        )}
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowReview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-2xl max-h-[80vh] overflow-y-auto p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Review Test</h2>

              {/* Summary */}
              <div className="mb-6 p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Test Summary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {answeredCount}/{test.questions.length} answered
                </p>
              </div>

              {/* Questions Review */}
              <div className="space-y-4 mb-6">
                {test.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 border rounded-lg border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900">
                        Question {idx + 1}
                      </p>
                      {userAnswers[q.id] ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                          Answered
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                          Not Answered
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">
                      {formatMathContent((q as any).text || q.question || '')}
                    </p>
                    {userAnswers[q.id] && (
                      <p className="text-sm">
                        <span className="text-gray-600">Your answer: </span>
                        <span className="font-semibold text-sky-600">
                          {userAnswers[q.id]}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReview(false)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Continue Editing
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Test'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
