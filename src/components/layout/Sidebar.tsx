import { NavLink } from 'react-router-dom'
import {
  Home,
  PenTool,
  ClipboardList,
  Layers,
  MessageCircle,
  BookOpen,
  TrendingUp,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/create-test', icon: PenTool, label: 'Create Test' },
  { path: '/tests', icon: ClipboardList, label: 'My Tests' },
  { path: '/flashcards', icon: Layers, label: 'Flash Cards' },
  { path: '/tutor', icon: MessageCircle, label: 'AI Tutor' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/progress', icon: TrendingUp, label: 'Progress' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-50 lg:relative lg:translate-x-0"
      >
        {/* Brand Section */}
        <div className="p-6 border-b border-gray-200">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-purple-pink flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-600">Quiz Wiz AI</h1>
              <p className="text-xs text-gray-500">Smart Study Made Easy</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}
