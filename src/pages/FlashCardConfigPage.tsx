import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import { toast } from 'sonner'
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

export default function FlashCardConfigPage() {
  const navigate = useNavigate()
  const uploadedFiles = useUploadStore((s) => s.files)
  const clearUploadFiles = useUploadStore((s) => s.clearFiles)
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [allFiles, setAllFiles] = useState<FileData[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form state
  const [deckName, setDeckName] = useState('')
  const [numCards, setNumCards] = useState(10)
  const [additionalPrompts, setAdditionalPrompts] = useState('')

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      setFileData(uploadedFiles[0])
      setAllFiles(uploadedFiles)
      return
    }

    navigate('/create-flashcards')
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
      console.error('Analysis error:', error?.response?.data || error)
      toast.error('Failed to analyze content. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateFlashCards = async () => {
    if (!analysis) {
      toast.error('Please wait for content analysis to complete')
      return
    }

    try {
      setIsGenerating(true)
      const payload = {
        deck_name: deckName || `${analysis.subject} Cards`,
        num_cards: numCards,
        topics: analysis.topics,
        additional_prompts: additionalPrompts,
        content_text: analysis.content_text,
      }

      const response = await api.post('/flashcards/generate', payload)
      clearUploadFiles()
      navigate(`/flashcards/${response.data.id || response.data.deck_id}`)
      toast.success('Flash cards generated successfully!')
    } catch (error: any) {
      const detail = error?.response?.data?.detail || 'Unknown error'
      console.error('Generate flashcards error:', error?.response?.data || error)
      toast.error(`Failed to generate flash cards: ${detail}`)
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Configure Flash Cards</h1>
        {analysis && (
          <p className="text-sm text-gray-500">
            {allFiles.length} file{allFiles.length > 1 ? 's' : ''} • {analysis.num_pages || 1} page{(analysis.num_pages || 1) > 1 ? 's' : ''} ready • Customize your deck
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
        {/* Deck Name */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Deck Name *</label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            placeholder="e.g., Biology Chapter 3 Terms"
          />
        </div>

        {/* Number of Cards - Slider */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Number of Cards</label>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cards:</span>
              <span className="text-2xl font-bold text-rose-500">{numCards}</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={numCards}
              onChange={(e) => setNumCards(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span>
              <span>30</span>
            </div>
          </div>
        </div>

        {/* Additional Prompts */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Additional Prompts</label>
          <textarea
            value={additionalPrompts}
            onChange={(e) => {
              if (e.target.value.length <= 1500) {
                setAdditionalPrompts(e.target.value)
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none h-28"
            placeholder="e.g., Focus on definitions, include examples..."
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-400">Add any additional instructions to the AI test creation tool (optional)</p>
            <span className="text-xs text-gray-400">{additionalPrompts.length}/1500</span>
          </div>
        </div>
      </div>

      {/* Create Flash Cards Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGenerateFlashCards}
        disabled={isGenerating || isAnalyzing || !analysis}
        className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-gradient-coral hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Cards...
          </>
        ) : (
          <>
            <Layers className="w-5 h-5" />
            Create Flash Cards
          </>
        )}
      </motion.button>
    </div>
  )
}
