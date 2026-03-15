import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Clock, Plus, Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'
import { ChatSession, ChatMessage } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AiTutorPage() {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Initialize new session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await api.post('/homework/sessions/new')
        setSessionId(response.data.session_id)
        setMessages([
          {
            role: 'assistant',
            content:
              'Hello! I\'m your AI Study Companion. I\'m here to help you learn and understand any topic. Feel free to ask me questions, request explanations, or discuss concepts. What would you like to study today?',
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        120
      ) + 'px'
    }
  }, [input])

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to UI
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      has_attachment: false,
      attachment_type: null,
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      setIsLoading(true)

      const response = await api.post(`/homework/chat`, {
        message: userMessage,
        session_id: sessionId,
      })

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response || 'I understand. How can I help you further?',
        timestamp: new Date().toISOString(),
        has_attachment: false,
        attachment_type: null,
      }

      setMessages((prev) => [...prev, aiMessage])
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
      setSessionId(response.data.session_id)
      setMessages([
        {
          role: 'assistant',
          content:
            'Hello! I\'m your AI Study Companion. I\'m here to help you learn and understand any topic. Feel free to ask me questions, request explanations, or discuss concepts. What would you like to study today?',
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
      className="flex flex-col h-[calc(100vh-120px)] space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Tutor</h1>
          <p className="text-gray-600">Your AI study companion</p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowHistory(!showHistory)
              if (!showHistory) loadSessions()
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Clock className="w-5 h-5" />
            History
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-teal-cyan text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Messages */}
          <motion.div
            className="flex-1 overflow-y-auto p-6 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-purple-pink text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user'
                        ? 'text-white/70'
                        : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-1 items-center p-3">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.1,
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.2,
                    }}
                  />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </motion.div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-3">
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
                className="input-primary resize-none overflow-hidden"
                rows={1}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-lg bg-gradient-purple-pink text-white hover:shadow-lg transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 bg-white rounded-lg border border-gray-200 p-4 flex flex-col"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Chat History</h3>

            {isLoadingSessions ? (
              <div className="flex justify-center items-center flex-1">
                <LoadingSpinner size="md" color="purple" />
              </div>
            ) : sessions.length > 0 ? (
              <motion.div
                className="space-y-2 overflow-y-auto flex-1"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {sessions.map((session) => (
                  <motion.button
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 5 }}
                    onClick={() => handleSelectSession(session)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.title || 'Untitled Chat'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No chat history yet
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
