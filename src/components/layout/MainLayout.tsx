import { ReactNode, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  PenTool,
  ClipboardList,
  Layers,
  MessageCircle,
  User,
  LogOut,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

interface MainLayoutProps {
  children: ReactNode
}

const bottomNavItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/create-test', icon: PenTool, label: 'Create' },
  { path: '/tests', icon: ClipboardList, label: 'Tests' },
  { path: '/create-flashcards', icon: Layers, label: 'Cards' },
  { path: '/tutor', icon: MessageCircle, label: 'Tutor' },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuthStore()
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const location = useLocation()

  const handleLogout = async () => {
    setShowAccountMenu(false)
    await logout()
  }

  // Check if a nav item is active (exact match for home, startsWith for others)
  const isNavActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <h1 className="text-lg font-bold text-sky-600">Quiz Wiz AI</h1>
        </div>

        {/* Account Icon */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center hover:bg-sky-200 transition-colors"
          >
            <User className="w-5 h-5 text-sky-600" />
          </button>

          {/* Account Dropdown */}
          <AnimatePresence>
            {showAccountMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAccountMenu(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-auto pb-safe">
        <div className="p-4 max-w-2xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 flex-shrink-0 z-30">
        <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isNavActive(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0"
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    active ? 'bg-sky-100' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? 'text-sky-600' : 'text-gray-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    active ? 'text-sky-600' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
