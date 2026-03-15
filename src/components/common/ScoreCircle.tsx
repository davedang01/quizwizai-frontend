import { motion } from 'framer-motion'

interface ScoreCircleProps {
  percentage: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ScoreCircle({
  percentage,
  size = 'md',
  showLabel = true,
}: ScoreCircleProps) {
  const getColor = () => {
    if (percentage >= 80) return '#10b981' // green
    if (percentage >= 50) return '#eab308' // yellow
    return '#ef4444' // red
  }

  const getTextColor = () => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  }

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  }

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
    >
      <svg className="absolute inset-0 transform -rotate-90" width="100%" height="100%">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50%"
          cy="50%"
          r="45"
          stroke={getColor()}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>

      {/* Text Content */}
      <div className="flex flex-col items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`font-bold ${textSizeClasses[size]} ${getTextColor()}`}
        >
          {Math.round(percentage)}%
        </motion.div>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`${labelSizeClasses[size]} text-gray-500`}
          >
            Score
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
