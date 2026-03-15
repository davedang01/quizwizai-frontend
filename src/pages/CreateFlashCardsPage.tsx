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

    reader.readAsDataURL(file)
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
      className="space-y-6"
      variants={containerVariants}
      initial={false}
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-6" variants={itemVariants}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-100 rounded-full mb-3">
          <Zap className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-xs font-semibold text-sky-600">
            AI-Powered Flash Cards
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-1">Create Flash Cards</h1>
        <p className="text-gray-600 text-sm">
          Upload your study material or create cards manually
        </p>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={containerVariants}
      >
        {/* Scan Photo */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => cameraInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-primary rounded-2xl p-5 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center"
          >
            <Camera className="w-10 h-10 mb-2" />
            <h3 className="text-base font-bold mb-0.5">Scan Photo</h3>
            <p className="text-[11px] text-white/80 text-center">
              Capture with camera
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => photoInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-teal-cyan rounded-2xl p-5 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center"
          >
            <Upload className="w-10 h-10 mb-2" />
            <h3 className="text-base font-bold mb-0.5">Upload Photo</h3>
            <p className="text-[11px] text-white/80 text-center">
              Choose from device
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => pdfInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-violet rounded-2xl p-5 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center"
          >
            <FileText className="w-10 h-10 mb-2" />
            <h3 className="text-base font-bold mb-0.5">Upload PDF</h3>
            <p className="text-[11px] text-white/80 text-center">
              Textbooks & docs
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/flashcards/manual')}
            className="w-full card-gradient bg-gradient-orange-amber rounded-2xl p-5 text-white hover:shadow-xl transition-all h-full flex flex-col items-center justify-center"
          >
            <PenLine className="w-10 h-10 mb-2" />
            <h3 className="text-base font-bold mb-0.5">Manual Entry</h3>
            <p className="text-[11px] text-white/80 text-center">
              Type your own cards
            </p>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        className="card p-6 bg-gradient-to-br from-sky-50 to-cyan-50"
        variants={itemVariants}
      >
        <h3 className="text-lg font-bold mb-3 text-gray-900">
          How it works
        </h3>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Create or Upload', description: 'Choose your content source' },
            { step: '2', title: 'Configure', description: 'Name your deck and set card count' },
            { step: '3', title: 'Study', description: 'Learn with interactive flash cards' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-primary text-white font-bold text-sm">
                  {item.step}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
