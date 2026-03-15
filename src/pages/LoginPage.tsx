import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

type AuthMode = 'signin' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, signup, isLoading } = useAuthStore()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (mode === 'signin') {
        await login(email, password)
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        await signup(name, email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />

      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Quiz Wiz AI</h1>
          <p className="text-gray-600">Smart Study Made Easy</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="card p-8"
          variants={itemVariants}
        >
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white shadow-sm text-sky-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white shadow-sm text-sky-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field - Sign Up Only */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-primary"
                  placeholder="John Doe"
                  required
                />
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-primary"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password - Sign Up Only */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-primary"
                  placeholder="••••••••"
                  required
                />
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-primary hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <p className="text-xs text-gray-500 mb-3">Demo credentials:</p>
            <div className="space-y-2 text-xs text-gray-600">
              <p>Email: <code className="bg-gray-100 px-2 py-1 rounded">demo@example.com</code></p>
              <p>Password: <code className="bg-gray-100 px-2 py-1 rounded">password123</code></p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
