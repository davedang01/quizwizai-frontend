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
  Menu,
  BookOpen,
  TrendingUp,
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

const drawerNavItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/create-test', icon: PenTool, label: 'Create Test' },
  { path: '/tests', icon: ClipboardList, label: 'My Tests' },
  { path: '/create-flashcards', icon: Layers, label: 'Create Flash Cards' },
  { path: '/flashcards', icon: BookOpen, label: 'My Flash Cards' },
  { path: '/tutor', icon: MessageCircle, label: 'AI Tutor' },
  { path: '/study-guide', icon: BookOpen, label: 'Study Guides' },
  { path: '/progress', icon: TrendingUp, label: 'Progress' },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuthStore()
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
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

      {/* Side Drawer Navigation */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="fixed left-0 top-0 h-screen w-80 bg-white shadow-xl z-50 flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 px-2 py-4">
                {drawerNavItems.map((item) => {
                  const Icon = item.icon
                  const active = isNavActive(item.path)
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowDrawer(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1"
                    >
                      <div
                        className={`flex items-center justify-center ${
                          active ? 'text-sky-600' : 'text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`font-medium ${
                          active
                            ? 'text-sky-600'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {item.label}
                      </span>
                      {active && (
                        <div className="ml-auto w-1 h-6 bg-sky-500 rounded-r" />
                      )}
                    </NavLink>
                  )
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-auto pb-20">
        <div className="p-4 max-w-2xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar - Fixed to bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
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
