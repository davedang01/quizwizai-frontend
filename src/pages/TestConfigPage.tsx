import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle, BookOpen, Calculator, PenLine, Shuffle, Brain, Zap, Printer, Mail, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useUploadStore } from '@/store/uploadStore'

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

interface GeneratedQuestion {
  id: string
  type: string
  text: string
  options?: string[]
  correct_answer: string
  difficulty: string
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

type OutputType = 'in-app' | 'print-pdf' | 'email-pdf'

function buildPrintableHTML(testName: string, questions: GeneratedQuestion[], difficulty: string, testType: string): string {
  const qTypeLabel = quizTypes.find(q => q.value === testType)?.label || testType
  const questionsHTML = questions.map((q, i) => {
    let answerArea = ''
    if (q.type === 'multiple_choice' && q.options) {
      answerArea = q.options.map((opt, j) =>
        `<div style="margin:6px 0;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
          <span style="font-weight:600;margin-right:8px;">${String.fromCharCode(65 + j)}.</span> ${opt}
        </div>`
      ).join('')
    } else if (q.type === 'fill_blank') {
      answerArea = '<div style="margin-top:8px;border-bottom:2px solid #333;width:60%;height:28px;"></div>'
    } else {
      answerArea = '<div style="margin-top:8px;min-height:60px;border:1px solid #ddd;border-radius:6px;padding:8px;"><span style="color:#aaa;font-size:12px;">Write your answer here</span></div>'
    }
    return `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <p style="font-weight:600;font-size:15px;margin-bottom:8px;">${i + 1}. ${q.text}</p>
        ${answerArea}
      </div>`
  }).join('')

  return `<!DOCTYPE html>
<html><head><title>${testName}</title>
<style>
  @media print { body { margin: 0.5in; } .no-print { display: none; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; }
  .header h1 { font-size: 24px; margin: 0 0 4px 0; }
  .header p { font-size: 13px; color: #666; margin: 2px 0; }
  .meta { display: flex; gap: 24px; justify-content: center; margin-top: 8px; }
  .meta span { font-size: 12px; color: #0284c7; font-weight: 600; }
  .name-line { margin: 24px 0; font-size: 14px; }
  .name-line span { border-bottom: 1px solid #333; display: inline-block; width: 250px; margin-left: 8px; }
</style></head><body>
  <div class="header">
    <h1>${testName}</h1>
    <div class="meta">
      <span>${qTypeLabel}</span>
      <span>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty</span>
      <span>${questions.length} Questions</span>
    </div>
  </div>
  <div class="name-line">Name: <span>&nbsp;</span> &nbsp;&nbsp; Date: <span>&nbsp;</span></div>
  <div>${questionsHTML}</div>
  <div class="no-print" style="text-align:center;margin-top:32px;">
    <button onclick="window.print()" style="padding:12px 32px;background:#0ea5e9;color:white;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Print This Test</button>
  </div>
</body></html>`
}

export default function TestConfigPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const scanId = searchParams.get('scan_id')
  const user = useAuthStore((s) => s.user)
  const uploadedFiles = useUploadStore((s) => s.files)
  const clearUploadFiles = useUploadStore((s) => s.clearFiles)
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [allFiles, setAllFiles] = useState<FileData[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingScan, setLoadingScan] = useState(false)

  // Form state
  const [testName, setTestName] = useState('')
  const [testType, setTestType] = useState('multiple-choice')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(5)
  const [additionalPrompts, setAdditionalPrompts] = useState('')
  const [outputType, setOutputType] = useState<OutputType>('in-app')
  const [emailAddress, setEmailAddress] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showContentPreview, setShowContentPreview] = useState(false)

  useEffect(() => {
    if (user?.email) {
      setEmailAddress(user.email)
    }
  }, [user])

  // If scan_id is present, fetch the saved scan analysis from the backend
  useEffect(() => {
    if (!scanId) return

    const fetchScan = async () => {
      try {
        setLoadingScan(true)
        setIsAnalyzing(true)
        const response = await api.get(`/scan/${scanId}`)
        setAnalysis(response.data)
        // Create a placeholder fileData so the page doesn't redirect
        setFileData({
          name: 'Previous scan',
          type: 'image/jpeg',
          size: 0,
          data: '',
          uploadType: 'photo',
        })
        toast.success('Previous scan loaded!')
      } catch (error) {
        toast.error('Failed to load previous scan. Please upload again.')
        navigate('/create-test')
      } finally {
        setIsAnalyzing(false)
        setLoadingScan(false)
      }
    }

    fetchScan()
  }, [scanId, navigate])

  useEffect(() => {
    // If scan_id is handling the load, skip file-based logic
    if (scanId) return

    // If we already have fileData loaded (analysis in progress or done), don't redirect
    // This prevents clearUploadFiles() from triggering a redirect after test generation
    if (fileData) return

    // Read files from in-memory store (no sessionStorage size limits)
    if (uploadedFiles.length > 0) {
      setFileData(uploadedFiles[0])
      setAllFiles(uploadedFiles)
      return
    }

    // No files available and nothing loaded yet — redirect back
    navigate('/create-test')
  }, [navigate, uploadedFiles, scanId, fileData])

  // Auto-analyze on file load (skip if loaded from scan_id)
  useEffect(() => {
    if (fileData && !analysis && !isAnalyzing && !scanId && !loadingScan) {
      handleAnalyze()
    }
  }, [fileData])

  const handleAnalyze = async () => {
    if (!fileData) return

    try {
      setIsAnalyzing(true)

      let response
      if (fileData.uploadType === 'pdf') {
        // For PDFs, analyze the first one (backend handles one at a time)
        let base64Data: string
        if (typeof fileData.data === 'string') {
          const dataStr = fileData.data as string
          base64Data = dataStr.includes(',') ? dataStr.split(',')[1] : dataStr
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
        // For images, send ALL images in the array
        const images_base64 = allFiles
          .filter(f => f.uploadType !== 'pdf')
          .map((file) => {
            const dataUrl = file.data as string
            return dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
          })

        response = await api.post('/scan/analyze', {
          images_base64,
        })
      }

      setAnalysis(response.data)
      toast.success('Content analyzed successfully!')
    } catch (error: any) {
      const status = error?.response?.status
      const detail = error?.response?.data?.detail

      if (status === 422) {
        // Image was unreadable / metadata-hallucination detected.
        // Clear upload state and bounce user back to the option page.
        clearUploadFiles()
        toast.error(
          detail || 'There was a problem processing your image(s). Please try again.',
          { duration: 6000 }
        )
        navigate('/create-test')
        return
      }

      if (detail) {
        toast.error(detail, { duration: 6000 })
      } else {
        toast.error('Failed to analyze content. Please try again.')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateTest = async () => {
    if (!analysis) {
      toast.error('Please wait for content analysis to complete')
      return
    }

    // If email output selected, validate email
    if (outputType === 'email-pdf') {
      if (!emailAddress || !emailAddress.includes('@')) {
        setShowEmailModal(true)
        return
      }
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
      const testId = response.data.id || response.data.test_id
      const generatedName = testName || `${analysis.subject} Quiz`

      clearUploadFiles()

      if (outputType === 'in-app') {
        navigate(`/test/${testId}`)
        toast.success('Test generated successfully!')
      } else {
        // For print and email, fetch the full test to get questions
        const testResponse = await api.get(`/tests/${testId}`)
        const questions: GeneratedQuestion[] = testResponse.data.questions

        const printHTML = buildPrintableHTML(generatedName, questions, difficulty, testType)
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(printHTML)
          printWindow.document.close()

          if (outputType === 'print-pdf') {
            // Small delay to let styles render, then trigger print
            setTimeout(() => printWindow.print(), 500)
            toast.success('Test generated! Print dialog opening...')
          } else {
            // Email: trigger print (save as PDF) then open mailto
            setTimeout(() => {
              printWindow.print()
              // After print dialog, open mailto
              const subject = encodeURIComponent(`Quiz Wiz AI: ${generatedName}`)
              const body = encodeURIComponent(
                `Hi,\n\nPlease find the attached test "${generatedName}" generated by Quiz Wiz AI.\n\n` +
                `Test Details:\n- Type: ${quizTypes.find(q => q.value === testType)?.label || testType}\n` +
                `- Difficulty: ${difficulty}\n- Questions: ${numQuestions}\n\n` +
                `To attach the PDF: Save the test from the print dialog as a PDF, then attach it to this email.\n\n` +
                `Best regards`
              )
              window.open(`mailto:${emailAddress}?subject=${subject}&body=${body}`, '_self')
              toast.success('Test generated! Save as PDF and attach to the email.')
            }, 500)
          }
        }

        // Also save the test for in-app viewing later
        navigate(`/tests`)
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail || 'Unknown error'
      const status = error?.response?.status
      // Handle math content validation gracefully
      if (status === 400 && detail.toLowerCase().includes('math')) {
        toast.error(detail, { duration: 5000 })
        // Suggest switching to a different quiz type
        setTestType('multiple-choice')
      } else if (status === 422) {
        // Content quality issue — analysis failed or content is garbage
        toast.error(detail, { duration: 6000 })
      } else {
        toast.error(`Failed to generate test: ${detail}`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  if (!fileData && !loadingScan) {
    return null
  }

  const outputOptions = [
    {
      type: 'in-app' as OutputType,
      icon: Brain,
      label: 'In-App Test',
      description: 'Take test in the app',
    },
    {
      type: 'print-pdf' as OutputType,
      icon: Printer,
      label: 'Print Test PDF',
      description: 'Generate & print PDF',
    },
    {
      type: 'email-pdf' as OutputType,
      icon: Mail,
      label: 'Email Test PDF',
      description: 'Generate & email PDF',
    },
  ]

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Configure Your Test</h1>
        {analysis && (
          <p className="text-sm text-gray-500">
            {scanId
              ? `${analysis.subject} • ${analysis.num_pages || 1} page${(analysis.num_pages || 1) > 1 ? 's' : ''} • Creating another version`
              : `${allFiles.length} file${allFiles.length > 1 ? 's' : ''} • ${analysis.num_pages || 1} page${(analysis.num_pages || 1) > 1 ? 's' : ''} ready • Customize your quiz settings`
            }
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

      {/* Content Preview — lets user verify the scan was read correctly */}
      {analysis && analysis.content_text && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowContentPreview((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-gray-900">What we read from your scan</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Tap to verify the content looks correct before generating your test
              </p>
            </div>
            {showContentPreview ? (
              <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </button>

          {showContentPreview && (
            <div className="px-5 pb-5 border-t border-gray-100">
              <div className="mt-3 bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
                  {analysis.content_text}
                </p>
              </div>
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Looks wrong?</span> Go back and re-scan with better lighting
                  or a closer shot so the text is clearly visible.
                </p>
              </div>
            </div>
          )}
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
              const isMathRecommended = qt.value === 'math-problems' && analysis &&
                /math|calcul|algebra|geometry|trigonometr|equation|fraction|decimal|arithmetic/i.test(
                  (analysis.subject || '') + ' ' + (analysis.topics || []).join(' ')
                )
              return (
                <button
                  key={qt.value}
                  onClick={() => setTestType(qt.value)}
                  className={`p-4 rounded-xl text-left transition-all relative ${
                    testType === qt.value
                      ? 'bg-sky-50 border-2 border-sky-500 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  {isMathRecommended && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
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
            {outputOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = outputType === opt.type
              return (
                <button
                  key={opt.type}
                  onClick={() => {
                    setOutputType(opt.type)
                    if (opt.type === 'email-pdf') {
                      setShowEmailModal(true)
                    }
                  }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isSelected
                      ? 'bg-sky-50 border-2 border-sky-500'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-sky-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-sky-600' : 'text-gray-400'}`} />
                  <p className={`text-xs font-semibold ${isSelected ? 'text-sky-700' : 'text-gray-600'}`}>{opt.label}</p>
                  <p className={`text-[10px] ${isSelected ? 'text-sky-500' : 'text-gray-400'}`}>{opt.description}</p>
                </button>
              )
            })}
          </div>

          {/* Email address display when email-pdf selected */}
          {outputType === 'email-pdf' && emailAddress && (
            <div className="mt-3 px-4 py-2.5 bg-sky-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-600" />
                <span className="text-sm text-gray-700">{emailAddress}</span>
              </div>
              <button
                onClick={() => setShowEmailModal(true)}
                className="text-xs text-sky-600 font-semibold hover:underline"
              >
                Change
              </button>
            </div>
          )}
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
            {outputType === 'in-app' ? 'Create Test' : outputType === 'print-pdf' ? 'Create & Print Test' : 'Create & Email Test'}
          </>
        )}
      </motion.button>

      {/* Email Address Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Email Address</h3>
              <button onClick={() => setShowEmailModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              The test PDF will be prepared for this email address.
            </p>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all mb-4"
              placeholder="student@email.com"
              autoFocus
            />
            <button
              onClick={() => setShowEmailModal(false)}
              disabled={!emailAddress || !emailAddress.includes('@')}
              className="w-full py-3 rounded-xl font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
