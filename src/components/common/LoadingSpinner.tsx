interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'sky' | 'pink' | 'teal' | 'orange'
}

export default function LoadingSpinner({
  size = 'md',
  color = 'sky',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colorClasses = {
    sky: 'border-sky-500',
    pink: 'border-pink-500',
    teal: 'border-teal-500',
    orange: 'border-orange-500',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-3 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
      />
    </div>
  )
}
