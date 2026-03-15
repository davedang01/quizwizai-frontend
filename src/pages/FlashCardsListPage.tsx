import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/utils/api'
import { FlashCardDeck } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function FlashCardsListPage() {
  const navigate = useNavigate()
  const [decks, setDecks] = useState<FlashCardDeck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await api.get('/flashcards')
        setDecks(response.data || [])
      } catch (error) {
        toast.error('Failed to load flash card decks')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDecks()
  }, [])

  const handleDelete = async (deckId: string) => {
    try {
      await api.delete(`/flashcards/${deckId}`)
      setDecks(decks.filter((d) => d.id !== deckId))
      setDeleteConfirm(null)
      toast.success('Deck deleted successfully')
    } catch (error) {
      toast.error('Failed to delete deck')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="sky" />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Flash Cards</h1>
          <p className="text-gray-600">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'} to study
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/create-flashcards')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Deck
        </motion.button>
      </motion.div>

      {/* Decks Grid */}
      {decks.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="card p-6 cursor-pointer group relative"
              onClick={() => navigate(`/flashcards/${deck.id}`)}
            >
              {/* Delete Button on Hover */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteConfirm(deck.id)
                }}
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>

              {/* Card Content */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all">
                  <Layers className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {deck.deck_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {deck.total_cards} {deck.total_cards === 1 ? 'card' : 'cards'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(deck.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          className="card p-12 text-center"
          variants={itemVariants}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mx-auto">
              <Layers className="w-10 h-10 text-sky-600" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No decks yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first flash card deck to start studying
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/create-flashcards')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create your first deck
          </motion.button>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete deck?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All cards in this deck will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
