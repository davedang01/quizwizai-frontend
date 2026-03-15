import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'

interface Card {
  id: string
  front: string
  back: string
}

export default function ManualFlashCardsPage() {
  const navigate = useNavigate()
  const [deckName, setDeckName] = useState('')
  const [cards, setCards] = useState<Card[]>([
    { id: '1', front: '', back: '' },
    { id: '2', front: '', back: '' },
    { id: '3', front: '', back: '' },
  ])
  const [isGenerating, setIsGenerating] = useState(false)

  const addCard = () => {
    const newId = String(Math.max(...cards.map((c) => parseInt(c.id) || 0)) + 1)
    setCards([...cards, { id: newId, front: '', back: '' }])
  }

  const updateCard = (id: string, field: 'front' | 'back', value: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const deleteCard = (id: string) => {
    if (cards.length > 2) {
      setCards(cards.filter((c) => c.id !== id))
    } else {
      toast.error('You must have at least 2 cards')
    }
  }

  const handleCreateDeck = async () => {
    // Validation
    if (!deckName.trim()) {
      toast.error('Deck name is required')
      return
    }

    const filledCards = cards.filter((c) => c.front.trim() && c.back.trim())
    if (filledCards.length < 2) {
      toast.error('You must have at least 2 cards with both front and back filled')
      return
    }

    try {
      setIsGenerating(true)
      const payload = {
        deck_name: deckName,
        cards: filledCards.map((c) => ({
          front: c.front.trim(),
          back: c.back.trim(),
        })),
      }

      const response = await api.post('/flashcards/manual', payload)
      toast.success('Deck created successfully!')
      navigate(`/flashcards/${response.data.deck_id}`)
    } catch (error) {
      toast.error('Failed to create deck')
    } finally {
      setIsGenerating(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">Create Flash Cards</h1>
        <p className="text-gray-600">
          Add your own terms and definitions
        </p>
      </motion.div>

      {/* Deck Name Input */}
      <motion.div className="card p-6" variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deck Name *
        </label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="input-primary"
          placeholder="e.g., Spanish Vocabulary"
        />
      </motion.div>

      {/* Cards List */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
      >
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            className="card p-6"
            variants={itemVariants}
          >
            <div className="flex items-start gap-4">
              {/* Card Number */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-purple-pink flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
              </div>

              {/* Card Inputs */}
              <div className="flex-1 space-y-4">
                {/* Front (Term) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front (Term)
                  </label>
                  <input
                    type="text"
                    value={card.front}
                    onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                    className="input-primary"
                    placeholder="Enter the term or question"
                  />
                </div>

                {/* Back (Definition) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back (Definition)
                  </label>
                  <textarea
                    value={card.back}
                    onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                    className="input-primary resize-none h-20"
                    placeholder="Enter the definition or answer"
                  />
                </div>
              </div>

              {/* Delete Button */}
              {cards.length > 2 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteCard(card.id)}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Card Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addCard}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-purple-300 text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Card
        </motion.button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex gap-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/create-flashcards')}
          className="flex-1 py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateDeck}
          disabled={isGenerating || !deckName.trim()}
          className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-purple-pink hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            'Create Deck'
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
