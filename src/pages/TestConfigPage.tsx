import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle, BookOpen, Calculator, PenLine, Shuffle, Brain, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import { toast } from 'sonner'

interface FileData {
  name: string
  type: string
  size: number
  data: string | ArrayBuffer
  uploadType: 'camera' | 'photo' | 'pdf'
}

interface AnalysisResult {
  id: string
  subject: string
  topics: string[]
  difficulty: string
  content_text: string
  num_pages: number
}

const quizTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice', description: 'Best for specific answers', icon: CheckCircle },
  { value: 'word-problems', label: 'Word Problems', description: 'Best for showing understanding & comprehension', icon: BookOpen },
  { value: 'fill-in-the-blank', label: 'Fill in the Blank', description: 'Complete sentences with missing words', icon: PenLine },
  { value: 'mixed', label: 'Mixed', description: 'Mix it up!', icon: Shuffle },
  { value: 'math-problems', label: 'Math Problems', description: 'For Math Subjects Only', icon: Calculator },
]

const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

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
  const [numQuestions, setNumQuestions] = useState(5)
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

  // Auto-analyze on file load
  useEffect(() => {
    if (fileData && !analysis && !isAnalyzing) {
      handleAnalyze()
    }
  }, [fileData])

  const handleAnalyze = async () => {
    if (!fileData) return

    try {
      setIsAnalyzing(true)

      let response
      if (fileData.uploadType === 'pdf') {
        // For PDFs: data is an ArrayBuffer stored as base64 via JSON serialization
        // Convert ArrayBuffer to base64 string
        let base64Data: string
        if (typeof fileData.data === 'string') {
          base64Data = fileData.data
        } else {
          const bytes = new Uint8Array(fileData.data as ArrayBuffer)
          let binary = ''
          bytes.forEach(b => binary += String.fromCharCode(b))
          base64Data = btoa(binary)
        }

        response = await api.post('/scan/analyze-pdf', {
          pdf_base64: base64Data,
          filename: fileData.name,
        })
      } else {
        // For images: data is a data URL like "data:image/png;base64,..."
        const dataUrl = fileData.data as string
        // Extract just the base64 portion if it's a data URL
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl

        response = await api.post('/scan/analyze', {
          images_base64: [base64Data],
        })
      }

      setAnalysis(response.data)
      toast.success('Content analyzed successfully!')
    } catch (error: any) {
      console.error('Analysis error:', error?.response?.data || error)
      toast.error('Failed to analyze content. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateTest = async () => {
    if (!analysis) {
      toast.error('Please wait for content analysis to complete')
      return
    }

    try {
      setIsGenerating(true)
      const payload = {
        test_name: testName || `${analysis.subject} Quiz`,
        test_type: testType,
        difficulty: difficulty,
        num_questions: numQuestions,
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

  if (!fileData) {
    return null
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Configure Your Test</h1>
        {analysis && (
          <p className="text-sm text-gray-500">
            {analysis.num_pages || 1} page{(analysis.num_pages || 1) > 1 ? 's' : ''} ready • Customize your quiz settings
          </p>
        )}
      </div>

      {/* Analyzing Banner */}
      {isAnalyzing && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
          <div>
            <p className="font-semibold text-sky-800 text-sm">Analyzing your photos...</p>
            <p className="text-sky-600 text-xs">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Analysis failed - retry */}
      {!isAnalyzing && !analysis && fileData && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-semibold text-red-800 text-sm mb-2">Analysis failed</p>
          <button
            onClick={handleAnalyze}
            className="text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-6">
        {/* Test Name */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Test Name *</label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            placeholder="e.g., Chapter 5 Math Quiz"
          />
        </div>

        {/* Level of Difficulty */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Level of Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  difficulty === d.value
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-sky-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Type */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Quiz Type</label>
          <div className="grid grid-cols-2 gap-3">
            {quizTypes.map((qt) => {
              const Icon = qt.icon
              return (
                <button
                  key={qt.value}
                  onClick={() => setTestType(qt.value)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    testType === qt.value
                      ? 'bg-sky-50 border-2 border-sky-500 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${testType === qt.value ? 'text-sky-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold ${testType === qt.value ? 'text-sky-700' : 'text-gray-700'}`}>
                    {qt.label}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{qt.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Number of Questions - Slider */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Number of Questions</label>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Questions:</span>
              <span className="text-2xl font-bold text-sky-600">{numQuestions}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Additional Prompts */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Additional Prompts</label>
          <textarea
            value={additionalPrompts}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setAdditionalPrompts(e.target.value)
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none h-28"
            placeholder="e.g., Focus on chapter 5 vocabulary, include word problems..."
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-400">Add any additional instructions to the AI test creation tool (optional)</p>
            <span className="text-xs text-gray-400">{additionalPrompts.length}/500</span>
          </div>
        </div>

        {/* Test Output */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Test Output</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-sky-50 border-2 border-sky-500 text-center">
              <Brain className="w-6 h-6 text-sky-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-sky-700">In-App Test</p>
              <p className="text-[10px] text-gray-500">Take test in the app</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-center opacity-50">
              <PenLine className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-500">Print Test PDF</p>
              <p className="text-[10px] text-gray-400">Generate & print PDF</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-center opacity-50">
              <PenLine className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-500">Email Test PDF</p>
              <p className="text-[10px] text-gray-400">Generate & email PDF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Test Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGenerateTest}
        disabled={isGenerating || isAnalyzing || !analysis}
        className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-gradient-coral hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Test...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Create Test
          </>
        )}
      </motion.button>
    </div>
  )
}

