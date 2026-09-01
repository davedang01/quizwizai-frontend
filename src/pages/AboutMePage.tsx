import { useEffect, useState } from 'react'
import { User, Save, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'

const PLACEHOLDER = `Grade: 7th grade

Favorite subjects: Science, History

Topics I'm currently studying: The American Civil War, basic algebra

Where I need the most help: Writing essay introductions, solving word problems

Learning style: I like step-by-step explanations with examples`

export default function AboutMePage() {
  const [aboutMe, setAboutMe] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/me')
        setAboutMe(res.data.about_me || '')
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await api.put('/auth/me/about', { about_me: aboutMe })
      toast.success('About Me saved! The AI will use this to personalise your study sessions.')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
          <User className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">About Me</h1>
          <p className="text-sm text-gray-500">Help the AI tutor understand you better</p>
        </div>
      </div>

      {/* Tip banner */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">How this helps</p>
          <p>Everything you write here is shared with the AI on every quiz, flashcard set, and tutor conversation — so it can pitch explanations at the right level, focus on your weak spots, and reference topics you're actually studying.</p>
        </div>
      </div>

      {/* Textarea */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your profile</p>
        </div>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={14}
            className="w-full px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none leading-relaxed"
          />
        )}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving…' : 'Save'}
        </motion.button>
      </div>
    </motion.div>
  )
}
