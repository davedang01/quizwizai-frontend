import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { toast } from 'sonner'

interface FileData {
  name: string
  type: string
  size: number
  data: string | ArrayBuffer
  uploadType: 'camera' | 'photo' | 'pdf'
}

interface AnalysisResult {
  subject: string
  topics: string[]
  difficulty: string
  content_text: string
}

export default function TestConfigPage() {
  const navigate = useNavigate()
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form state
  const [testName, setTestName] = useState('')
  const [testType, setTestType] = useState('multiple-choice')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState('10')
  const [additionalPrompts, setAdditionalPrompts] = useState('')

  useEffect(() => {
    const uploadedFile = sessionStorage.getItem('uploadedFile')
    if (!uploadedFile) {
      navigate('/create-test')
      return
    }

    try {
      const parsed = JSON.parse(uploadedFile) as FileData
      setFileData(parsed)
    } catch (error) {
      toast.error('Failed to load uploaded file')
      navigate('/create-test')
    }
  }, [navigate])

  const handleAnalyze = async () => {
    if (!fileData) return

    try {
      setIsAnalyzing(true)
      const formData = new FormData()

      if (fileData.uploadType === 'pdf') {
        const binaryString = atob(fileData.data as string)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        formData.append('file', blob, fileData.name)

        const response = await api.post('/scan/analyze-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setAnalysis(response.data)
      } else {
        formData.append('file', fileData.data as string)
        const response = await api.post('/scan/analyze', formData)
        setAnalysis(response.data)
      }

      toast.success('Content analyzed successfully!')
    } catch (error) {
      toast.error('Failed to analyze content')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateTest = async () => {
    if (!analysis || !testName) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsGenerating(true)
      const payload = {
        test_name: testName,
        test_type: testType,
        difficulty: difficulty || analysis.difficulty,
        num_questions: parseInt(numQuestions),
        topics: analysis.topics,
        additional_prompts: additionalPrompts,
        content_text: analysis.content_text,
      }

      const response = await api.post('/tests/generate', payload)
      sessionStorage.removeItem('uploadedFile')
      navigate(`/test/${response.data.test_id}`)
      toast.success('Test generated successfully!')
    } catch (error) {
      toast.error('Failed to generate test')
    } finally {
      setIsGenerating(false)
    }
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

  if (!fileData) {
    return null
  }

  return (
    <motion.div
      className="space-y-8 max-w-3xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
          <Zap className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">
            Configure Your Test
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Test Configuration</h1>
      </motion.div>

      {/* File Preview */}
      <motion.div className="card p-6" variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-4">Uploaded File</h3>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            {fileData.uploadType === 'pdf' ? (
              <Upload className="w-6 h-6 text-purple-600" />
            ) : (
              <Upload className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {fileData.name}
            </p>
            <p className="text-sm text-gray-600">
              {(fileData.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      </motion.div>

      {/* Analysis Section */}
      {!analysis ? (
        <motion.div className="card p-6" variants={itemVariants}>
          <h3 className="text-lg font-semibold mb-4">Step 1: Analyze Content</h3>
          <p className="text-gray-600 mb-6">
            Let AI analyze your uploaded content to identify topics and difficulty level.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-purple-pink hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze Content'
            )}
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Analysis Results */}
          <motion.div className="card p-6" variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <p className="px-4 py-3 rounded-lg bg-gray-50 font-medium text-gray-900">
                  {analysis.subject}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detected Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Difficulty
                </label>
                <p className="px-4 py-3 rounded-lg bg-gray-50 font-medium text-gray-900 capitalize">
                  {analysis.difficulty}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Configuration Form */}
          <motion.div className="card p-6" variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6">Step 2: Configure Test</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Name *
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="input-primary"
                  placeholder="e.g., Biology Chapter 5 Quiz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="input-primary"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="input-primary"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="input-primary"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={additionalPrompts}
                  onChange={(e) => setAdditionalPrompts(e.target.value)}
                  className="input-primary resize-none h-24"
                  placeholder="Any specific focus areas or instructions for test generation..."
                />
              </div>
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/create-test')}
              className="flex-1 py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateTest}
              disabled={isGenerating || !testName}
              className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-purple-pink hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Test...
                </span>
              ) : (
                'Generate Test'
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
