import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Clock, Plus, Bot, Camera, ImageIcon, Upload, Mic, MicOff, Volume2, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'
import { ChatSession, ChatMessage } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatMathContent } from '@/utils/formatMath'

const GREETING_MESSAGE =
  "Hi! I'm your AI Tutor. Ask me questions on your homework or any academic subject and I'll help teach concepts and provide answers. You can also upload a photo of a problem you're stuck on, or tap the mic to talk to me. I'm here to help, but not do your homework for you!"

export default function AiTutorPage() {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [pendingImageName, setPendingImageName] = useState<string | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  // Voice mode state
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await api.post('/homework/sessions/new')
        setSessionId(response.data.id || response.data.session_id)
        setMessages([
          {
            role: 'assistant',
            content: GREETING_MESSAGE,
            timestamp: new Date().toISOString(),
            has_attachment: false,
            attachment_type: null,
          },
        ])
      } catch (error) {
        toast.error('Failed to start chat session')
      }
    }

    initSession()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        120
      ) + 'px'
    }
  }, [input])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      let dataURL = reader.result as string
      // Compress if needed
      try {
        const { compressImageDataURL } = await import('@/utils/compressImage')
        dataURL = await compressImageDataURL(dataURL)
      } catch { /* use original */ }
      const base64 = dataURL.split(',')[1]
      setPendingImage(base64)
      setPendingImageName(file.name)
      setShowAttachMenu(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('PDF must be under 20 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      setPendingImage(base64)
      setPendingImageName(file.name)
      setShowAttachMenu(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // --- Voice Mode ---
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
  }, [])

  const speakText = useCallback((text: string) => {
    if (!synthRef.current) return
    stopSpeaking()
    // Clean markdown formatting for speech
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/```[\s\S]*?```/g, 'code block omitted')
      .replace(/`(.*?)`/g, '$1')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.onend = () => {
      setIsSpeaking(false)
      // Auto-resume listening after response in voice mode
      if (isVoiceMode) {
        setTimeout(() => startListening(), 500)
      }
    }
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    synthRef.current.speak(utterance)
  }, [stopSpeaking, isVoiceMode])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser')
      return
    }
    stopSpeaking()
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let finalTranscript = ''
    let silenceTimer: ReturnType<typeof setTimeout> | null = null

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        } else {
          interim += event.results[i][0].transcript
        }
      }
      setVoiceTranscript(finalTranscript + interim)

      // Reset silence timer on each result
      if (silenceTimer) clearTimeout(silenceTimer)
      silenceTimer = setTimeout(() => {
        // 2 seconds of silence → auto-send
        if (finalTranscript.trim()) {
          recognition.stop()
        }
      }, 2000)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (finalTranscript.trim()) {
        setInput(finalTranscript.trim())
        setVoiceTranscript('')
        // Auto-send after voice input
        setTimeout(() => {
          const sendBtn = document.getElementById('tutor-send-btn')
          sendBtn?.click()
        }, 100)
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
        toast.error('Voice input error. Please try again.')
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setVoiceTranscript('')
  }, [stopSpeaking])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      // Turning off voice mode
      stopListening()
      stopSpeaking()
      setIsVoiceMode(false)
      setVoiceTranscript('')
    } else {
      // Turning on voice mode
      setIsVoiceMode(true)
      startListening()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      synthRef.current?.cancel()
    }
  }, [])

  const handleSendMessage = async () => {
    if ((!input.trim() && !pendingImage) || !sessionId || isLoading) return

    const userMessage = input.trim()
    const imageToSend = pendingImage
    setInput('')
    setPendingImage(null)
    setPendingImageName(null)

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage || (imageToSend ? '📷 [Image uploaded]' : ''),
      timestamp: new Date().toISOString(),
      has_attachment: !!imageToSend,
      attachment_type: imageToSend ? 'image' : null,
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      setIsLoading(true)
      const response = await api.post(`/homework/chat`, {
        message: userMessage || 'Can you help me with this?',
        session_id: sessionId,
        has_attachment: !!imageToSend,
        attachment_type: imageToSend ? 'image' : null,
        image_base64: imageToSend || undefined,
      })

      const aiContent = response.data.response || 'I understand. How can I help you further?'
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
        has_attachment: false,
        attachment_type: null,
      }
      setMessages((prev) => [...prev, aiMessage])

      // In voice mode, read the response aloud
      if (isVoiceMode) {
        speakText(aiContent)
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true)
      const response = await api.get('/homework/sessions')
      setSessions(response.data || [])
    } catch (error) {
      toast.error('Failed to load chat history')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleSelectSession = async (session: ChatSession) => {
    setSessionId(session.id)
    setMessages(session.messages || [])
    setShowHistory(false)
  }

  const handleNewChat = async () => {
    try {
      const response = await api.post('/homework/sessions/new')
      setSessionId(response.data.id || response.data.session_id)
      setMessages([
        {
          role: 'assistant',
          content: GREETING_MESSAGE,
          timestamp: new Date().toISOString(),
          has_attachment: false,
          attachment_type: null,
        },
      ])
      setShowHistory(false)
    } catch (error) {
      toast.error('Failed to create new chat session')
    }
  }

  return (
    <motion.div
      className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)] -mx-4 -mt-4 lg:-mx-8 lg:-mt-8"
      initial={false}
      animate={{ opacity: 1 }}
    >
      {/* ── DESKTOP LEFT SIDEBAR: Session History ─────────── */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-gray-200 bg-gray-50 flex-shrink-0">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-500" />
            <h2 className="font-bold text-gray-900">AI Tutor</h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </motion.button>
        </div>

        {/* Session History */}
        <div className="flex-1 overflow-y-auto p-3">
          <button
            onClick={() => { loadSessions(); setShowHistory(true) }}
            className="w-full text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 pb-2 flex items-center gap-1 hover:text-sky-600"
          >
            <Clock className="w-3.5 h-3.5" />
            Recent Chats
          </button>
          {isLoadingSessions ? (
            <div className="flex justify-center py-4"><LoadingSpinner size="sm" color="sky" /></div>
          ) : sessions.length > 0 ? (
            <div className="space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-white transition-colors border ${
                    sessionId === session.id ? 'bg-white border-sky-200 shadow-sm' : 'border-transparent'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 truncate">{session.title || 'Untitled Chat'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(session.created_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No previous chats</p>
              <p className="text-xs text-gray-400 mt-1">Start a new conversation!</p>
            </div>
          )}
        </div>

        {/* Tips panel at bottom */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tips</p>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li className="flex items-start gap-1.5"><span className="text-sky-400 font-bold mt-0.5">📷</span> Upload a photo of a problem</li>
            <li className="flex items-start gap-1.5"><span className="text-sky-400 font-bold mt-0.5">🎤</span> Use voice mode to talk hands-free</li>
            <li className="flex items-start gap-1.5"><span className="text-sky-400 font-bold mt-0.5">📄</span> Share a PDF for help</li>
          </ul>
        </div>
      </aside>

      {/* ── CHAT PANEL ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

      {/* Header (mobile only — desktop has sidebar) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white lg:hidden">
        <div>
          <h1 className="text-lg font-bold text-gray-900">AI Tutor</h1>
          <p className="text-xs text-gray-500">Your study companion</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowHistory(!showHistory)
              if (!showHistory) loadSessions()
            }}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Clock className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="p-2 rounded-lg bg-gradient-primary text-white"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Mobile History Panel */}
      {showHistory && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-gray-50 border-b border-gray-200 max-h-48 overflow-y-auto lg:hidden"
        >
          {isLoadingSessions ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" color="sky" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.title || 'Untitled Chat'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No chat history yet
            </p>
          )}
        </motion.div>
      )}

      {/* Desktop Chat Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div>
          <h2 className="font-semibold text-gray-900">Current Session</h2>
          <p className="text-xs text-gray-400">{messages.length - 1} message{messages.length !== 2 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {isVoiceMode && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              <Mic className="w-3 h-3" />
              Voice Mode Active
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-3 bg-white">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-2 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-sky-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.has_attachment && msg.attachment_type === 'image' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-xs opacity-70">Photo attached</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.role === 'assistant'
                  ? formatMathContent(msg.content)
                  : msg.content}
              </p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.role === 'user' ? 'text-white/60' : 'text-gray-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex gap-1 items-center px-3 py-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-gray-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-gray-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-gray-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Mode Overlay */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t border-sky-200 px-4 py-4 bg-gradient-to-b from-sky-50 to-white"
          >
            <div className="flex flex-col items-center gap-3">
              {/* Listening indicator */}
              <div className="flex items-center gap-2">
                {isListening ? (
                  <>
                    <motion.div
                      className="w-3 h-3 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium text-gray-700">Listening...</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <Volume2 className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-medium text-sky-600">Speaking...</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Tap mic to speak</span>
                )}
              </div>

              {/* Voice transcript preview */}
              {voiceTranscript && (
                <p className="text-sm text-gray-600 text-center max-w-xs italic">
                  "{voiceTranscript}"
                </p>
              )}

              {/* Controls */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isSpeaking || isLoading}
                  className={`p-4 rounded-full transition-colors disabled:opacity-40 ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </motion.button>

                {isSpeaking && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={stopSpeaking}
                    className="p-3 rounded-full bg-gray-200 text-gray-600"
                    title="Stop speaking"
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.button>
                )}
              </div>

              <button
                onClick={toggleVoiceMode}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Exit voice mode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      {!isVoiceMode && (
        <div className="border-t border-gray-200 px-4 lg:px-6 py-3 bg-white">
          {/* Pending attachment preview */}
          {pendingImage && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-sky-50 rounded-lg border border-sky-200">
              {pendingImageName?.endsWith('.pdf') ? (
                <FileText className="w-4 h-4 text-sky-500 flex-shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-sky-500 flex-shrink-0" />
              )}
              <span className="text-xs text-sky-700 truncate flex-1">
                {pendingImageName || 'File attached'}
              </span>
              <button
                onClick={() => { setPendingImage(null); setPendingImageName(null) }}
                className="text-xs text-sky-500 hover:text-sky-700 font-medium"
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePdfSelect}
              className="hidden"
            />

            {/* Attach button with dropdown */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 flex-shrink-0"
                title="Attach file"
              >
                <Upload className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-w-[160px] z-20"
                  >
                    <button
                      onClick={() => { cameraInputRef.current?.click() }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-500" />
                      Take Photo
                    </button>
                    <button
                      onClick={() => { fileInputRef.current?.click() }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      Upload Image
                    </button>
                    <button
                      onClick={() => { pdfInputRef.current?.click() }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      Upload PDF
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice mode button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoiceMode}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-sky-50 hover:text-sky-500 transition-colors disabled:opacity-40 flex-shrink-0"
              title="Voice mode"
            >
              <Mic className="w-5 h-5" />
            </motion.button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:outline-none resize-none overflow-hidden text-sm"
              rows={1}
            />
            <motion.button
              id="tutor-send-btn"
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={(!input.trim() && !pendingImage) || isLoading}
              className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      )}
      </div>{/* end chat panel */}
    </motion.div>
  )
}
