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

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await api.post('/homework/sessions/new')
        setSessionId(response.data.id || response.data.session_id)
        setMessages([
          {
            role: 'assistant',
            content:
              'Hello! I\'m your AI Study Companion. I\'m here to help you learn and understand any topic. What would you like to study today?',
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

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return

    const userMessage = input.trim()
    setInput('')

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
      setSessionId(response.data.id || response.data.session_id)
      setMessages([
        {
          role: 'assistant',
          content:
            'Hello! I\'m your AI Study Companion. What would you like to study today?',
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
      className="flex flex-col h-[calc(100vh-8rem)] -mx-4 -mt-4"
      initial={false}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
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

      {/* History Panel */}
      {showHistory && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-gray-50 border-b border-gray-200 max-h-48 overflow-y-auto"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
              <p className="text-sm leading-relaxed">{msg.content}</p>
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

      {/* Input Area */}
      <div className="border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex gap-2">
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
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
