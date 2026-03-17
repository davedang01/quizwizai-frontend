import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, CheckCircle2, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'
import { StudyGuide } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatMathContent } from '@/utils/formatMath'

export default function StudyGuideDetailPage() {
  const { resultId } = useParams<{ resultId: string }>()
  const navigate = useNavigate()
  const [guide, setGuide] = useState<StudyGuide | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchGuide = async () => {
      if (!resultId) return

      try {
        setIsLoading(true)

        // Try to fetch existing guide
        try {
          const response = await api.get(`/study-guides/result/${resultId}`)
          setGuide(response.data)
        } catch (error: any) {
          // If guide doesn't exist, generate it
          if (error.response?.status === 404) {
            setIsGenerating(true)
            const generateResponse = await api.post('/study-guides/generate', {
              result_id: resultId,
            })
            setGuide(generateResponse.data)
          } else {
            throw error
          }
        }
      } catch (error) {
        toast.error('Failed to load study guide')
        navigate('/study-guide')
      } finally {
        setIsLoading(false)
        setIsGenerating(false)
      }
    }

    fetchGuide()
  }, [resultId, navigate])

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

  if (isLoading && !guide) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        {isGenerating && (
          <>
            <LoadingSpinner size="lg" color="sky" />
            <p className="text-gray-600">Generating your personalized study guide...</p>
          </>
        )}
        {!isGenerating && <LoadingSpinner size="lg" color="sky" />}
      </div>
    )
  }

  if (!guide) {
    return null
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial={false}
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-4"
        variants={itemVariants}
      >
        <button
          onClick={() => navigate('/study-guide')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {guide.test_name}
          </h1>
          <p className="text-gray-600">
            Detailed analysis of your incorrect answers
          </p>
        </div>
      </motion.div>

      {/* Guide Entries */}
      {guide.guides.length > 0 ? (
        <motion.div
          className="space-y-6"
          variants={containerVariants}
        >
          {guide.guides.map((entry, idx) => (
            <motion.div
              key={entry.question_id}
              variants={itemVariants}
              className="card p-6 border-l-4 border-red-500"
            >
              {/* Question Number */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                  Q{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {formatMathContent(entry.question || '')}
                </h3>
              </div>

              {/* Answer Comparison */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
                {/* Your Answer */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Your Answer
                    </span>
                  </div>
                  <p className="text-sm text-red-600 font-semibold">
                    {formatMathContent(entry.user_answer || '')}
                  </p>
                </div>

                {/* Correct Answer */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Correct Answer
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold">
                    {formatMathContent(entry.correct_answer || '')}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              {entry.explanation && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900">Explanation</h4>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {formatMathContent(entry.explanation || '')}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Study Tips */}
              {entry.tips && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Study Tips</h4>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {formatMathContent(entry.tips || '')}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Practice Question */}
              {entry.practice_question && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-5 h-5 text-sky-600" />
                    <h4 className="font-semibold text-gray-900">
                      Practice Question
                    </h4>
                  </div>
                  <div className="bg-sky-50 border-l-4 border-sky-400 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {formatMathContent(entry.practice_question || '')}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="card p-12 text-center"
          variants={itemVariants}
        >
          <p className="text-gray-600">
            No incorrect answers to review for this test. Great job!
          </p>
        </motion.div>
      )}

      {/* Back Button */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/study-guide')}
          className="flex-1 py-3 px-4 rounded-lg font-semibold border-2 border-sky-500 text-sky-600 hover:bg-sky-50 transition-colors"
        >
          Back to Study Guides
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/tests')}
          className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-primary hover:shadow-lg transition-all"
        >
          View All Tests
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
