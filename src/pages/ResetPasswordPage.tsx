import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/utils/api'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid reset link. Please request a new one.')
      return
    }

    setIsLoading(true)
    try {
      const resp = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      })
      setIsSuccess(true)
      toast.success(resp.data.message || 'Password reset successfully!')
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to reset password'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
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
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />

      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial={false}
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Quiz Wiz AI</h1>
          <p className="text-gray-600">Set Your New Password</p>
        </motion.div>

        <motion.div className="card p-8" variants={itemVariants}>
          {!token ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Invalid Reset Link</h3>
              <p className="text-gray-600 text-sm">
                This password reset link is invalid or missing. Please request a new one from the sign-in page.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-primary hover:shadow-lg transition-all"
              >
                Go to Sign In
              </button>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Password Reset!</h3>
              <p className="text-gray-600 text-sm">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-primary hover:shadow-lg transition-all"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-primary"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-primary"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

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
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
