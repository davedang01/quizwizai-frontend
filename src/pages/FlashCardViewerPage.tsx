import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Shuffle, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'
import { FlashCardDeck } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function FlashCardViewerPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<FlashCardDeck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [displayCards, setDisplayCards] = useState(deck?.cards || [])

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) return
      try {
        const response = await api.get(`/flashcards/${deckId}`)
        setDeck(response.data)
        setDisplayCards(response.data.cards)
      } catch (error) {
        toast.error('Failed to load flash card deck')
        navigate('/flashcards')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeck()
  }, [deckId, navigate])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      else if (e.key === 'ArrowRight') goToNext()
      else if (e.key === ' ') {
        e.preventDefault()
        setIsFlipped(!isFlipped)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isFlipped, displayCards])

  const goToNext = () => {
    if (currentIndex < displayCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5)
    setDisplayCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    toast.success('Cards shuffled!')
  }

  const handleReset = () => {
    setDisplayCards([...deck!.cards])
    setCurrentIndex(0)
    setIsFlipped(false)
    toast.success('Reset to original order')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="purple" />
      </div>
    )
  }

  if (!deck || displayCards.length === 0) {
    return null
  }

  const currentCard = displayCards[currentIndex]
  const progress = ((currentIndex + 1) / displayCards.length) * 100

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/flashcards')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {deck.deck_name}
            </h1>
            <p className="text-gray-600">
              Card {currentIndex + 1} of {displayCards.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShuffle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Shuffle cards"
          >
            <Shuffle className="w-5 h-5 text-gray-700" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Reset to original order"
          >
            <RotateCcw className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="h-full bg-gradient-purple-pink"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Card Area */}
      <motion.div
        className="flex flex-col items-center justify-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 3D Flip Card */}
        <div
          className="w-full max-w-2xl h-80 perspective"
          style={{
            perspective: '1000px',
          }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front of Card */}
            <div
              className="absolute w-full h-full bg-gradient-purple-pink rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer shadow-xl"
              style={{
                backfaceVisibility: 'hidden',
              }}
              onClick={() => setIsFlipped(true)}
            >
              <div className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wide">
                Question
              </div>
              <p className="text-3xl font-bold text-white text-center leading-tight">
                {currentCard.front}
              </p>
              <div className="mt-12 text-white/60 text-sm">
                Tap to reveal answer
              </div>
            </div>

            {/* Back of Card */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer shadow-xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              onClick={() => setIsFlipped(false)}
            >
              <div className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wide">
                Answer
              </div>
              <p className="text-3xl font-bold text-white text-center leading-tight">
                {currentCard.back}
              </p>
              <div className="mt-12 text-white/60 text-sm">
                Tap to go back
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="p-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="text-center min-w-max">
            <p className="text-gray-600 text-sm">
              {currentIndex + 1} / {displayCards.length}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNext}
            disabled={currentIndex === displayCards.length - 1}
            className="p-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Keyboard Hints */}
        <motion.div
          className="text-center text-sm text-gray-500 mt-8 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>← → Arrow keys to navigate</p>
          <p>Space bar to flip card</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
