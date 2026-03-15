import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, FileText, PenLine, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CreateFlashCardsPage() {
  const navigate = useNavigate()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'camera' | 'photo' | 'pdf'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target?.result,
        uploadType: type,
      }
      sessionStorage.setItem('uploadedFile', JSON.stringify(fileData))
      navigate('/flashcard-config')
    }

    if (type === 'pdf') {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsDataURL(file)
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

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
          <Zap className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">
            AI-Powered Flash Cards
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Create Flash Cards</h1>
        <p className="text-gray-600">
          Upload your study material or create cards manually
        </p>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Scan Photo */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => cameraInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-purple-pink rounded-2xl p-8 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center group"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Camera className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Scan Photo</h3>
            <p className="text-sm text-white/90 text-center">
              Capture study material with your camera
            </p>
          </motion.button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e, 'camera')}
            className="hidden"
          />
        </motion.div>

        {/* Upload Photo */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => photoInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-teal-cyan rounded-2xl p-8 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center group"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            >
              <Upload className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Upload Photo</h3>
            <p className="text-sm text-white/90 text-center">
              Choose an image from your device
            </p>
          </motion.button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'photo')}
            className="hidden"
          />
        </motion.div>

        {/* Upload PDF */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => pdfInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-teal-cyan rounded-2xl p-8 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center group"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            >
              <FileText className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Upload PDF</h3>
            <p className="text-sm text-white/90 text-center">
              Upload textbooks or documents
            </p>
          </motion.button>
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileSelect(e, 'pdf')}
            className="hidden"
          />
        </motion.div>

        {/* Manual Entry */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/flashcards/manual')}
            className="w-full card-gradient bg-gradient-orange-amber rounded-2xl p-8 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center group"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              <PenLine className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Manual Entry</h3>
            <p className="text-sm text-white/90 text-center">
              Create cards by typing terms and definitions
            </p>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        className="card p-8 bg-gradient-to-br from-purple-50 to-pink-50"
        variants={itemVariants}
      >
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          How it works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Create or Upload',
              description: 'Choose your content source: upload files or type manually',
            },
            {
              step: '2',
              title: 'Configure',
              description: 'Name your deck and set the number of cards',
            },
            {
              step: '3',
              title: 'Study',
              description: 'Learn with interactive flash cards and track progress',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-purple-pink text-white font-bold">
                  {item.step}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
