import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, FileText, PenLine, Zap, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useUploadStore } from '@/store/uploadStore'

interface FileData {
  name: string
  type: string
  size: number
  data: string | ArrayBuffer
  uploadType: 'camera' | 'photo' | 'pdf'
}

export default function CreateFlashCardsPage() {
  const navigate = useNavigate()
  const setUploadFiles = useUploadStore((s) => s.setFiles)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [cameraCaptures, setCameraCaptures] = useState<FileData[]>([])
  const [showCameraPreview, setShowCameraPreview] = useState(false)

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    const count = fileList.length

    try {
      const results: FileData[] = await Promise.all(
        fileList.map(async (file) => {
          const data = await readFileAsDataURL(file)
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data,
            uploadType: 'photo' as const,
          }
        })
      )

      setUploadFiles(results)
      toast.success(`${count} photo${count > 1 ? 's' : ''} selected`)
      navigate('/flashcard-config')
    } catch (err) {
      console.error('Photo read error:', err)
      toast.error('Failed to read selected photos. Please try again.')
    }
  }

  const handlePdfSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    const count = fileList.length

    try {
      const results: FileData[] = await Promise.all(
        fileList.map(async (file) => {
          const data = await readFileAsDataURL(file)
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data,
            uploadType: 'pdf' as const,
          }
        })
      )

      setUploadFiles(results)
      toast.success(`${count} PDF${count > 1 ? 's' : ''} selected`)
      navigate('/flashcard-config')
    } catch (err) {
      console.error('PDF read error:', err)
      toast.error('Failed to read selected PDFs. Please try again.')
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileData: FileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target?.result || '',
        uploadType: 'camera',
      }

      setCameraCaptures((prev) => [...prev, fileData])
      setShowCameraPreview(true)
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const removeCameraCapture = (index: number) => {
    setCameraCaptures((prev) => prev.filter((_, i) => i !== index))
  }

  const finalizeCameraCaptures = () => {
    if (cameraCaptures.length === 0) return
    setUploadFiles(cameraCaptures)
    setCameraCaptures([])
    setShowCameraPreview(false)
    toast.success(`${cameraCaptures.length} photo${cameraCaptures.length > 1 ? 's' : ''} ready for analysis`)
    navigate('/flashcard-config')
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
          {showCameraPreview && cameraCaptures.length > 0 ? (
            <div className="bg-white rounded-2xl border-2 border-sky-200 p-4 space-y-3 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  {cameraCaptures.length} photo{cameraCaptures.length > 1 ? 's' : ''}
                </h3>
                <button
                  onClick={() => {
                    setCameraCaptures([])
                    setShowCameraPreview(false)
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-1">
                {cameraCaptures.map((capture, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={capture.data as string}
                      alt={`Capture ${idx + 1}`}
                      className="w-full h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeCameraCapture(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-col text-xs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2 rounded-xl font-semibold text-sky-600 bg-sky-50 border border-sky-300 hover:bg-sky-100 transition-all flex items-center justify-center gap-1"
                >
                  <Camera className="w-4 h-4" />
                  Add
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={finalizeCameraCaptures}
                  className="py-2 rounded-xl font-semibold text-white bg-gradient-primary hover:shadow-lg transition-all"
                >
                  Done
                </motion.button>
              </div>
            </div>
          ) : (
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
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
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
            multiple
            onChange={handlePhotoSelect}
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
            multiple
            onChange={handlePdfSelect}
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
