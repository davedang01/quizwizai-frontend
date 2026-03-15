import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, FileText, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function CreateTestPage() {
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
      navigate('/test-config')
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
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-6" variants={itemVariants}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-100 rounded-full mb-3">
          <Zap className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-xs font-semibold text-sky-600">
            AI-Powered Tests
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-1">Create Test</h1>
        <p className="text-gray-600 text-sm">
          Upload your study material and let AI generate personalized tests
        </p>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
      >
        {/* Scan Photo */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => cameraInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-primary rounded-2xl p-6 text-white hover:shadow-xl transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Camera className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold mb-0.5">Scan Photo</h3>
              <p className="text-sm text-white/80">
                Use your camera to capture study material
              </p>
            </div>
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => photoInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-teal-cyan rounded-2xl p-6 text-white hover:shadow-xl transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold mb-0.5">Upload Photo</h3>
              <p className="text-sm text-white/80">
                Choose an image from your device
              </p>
            </div>
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => pdfInputRef.current?.click()}
            className="w-full card-gradient bg-gradient-violet rounded-2xl p-6 text-white hover:shadow-xl transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold mb-0.5">Upload PDF</h3>
              <p className="text-sm text-white/80">
                Upload textbooks or documents
              </p>
            </div>
          </motion.button>
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileSelect(e, 'pdf')}
            className="hidden"
          />
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
            { step: '1', title: 'Upload', description: 'Scan or upload your study material' },
            { step: '2', title: 'Configure', description: 'Customize difficulty and question types' },
            { step: '3', title: 'Study', description: 'Take personalized tests and track progress' },
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
