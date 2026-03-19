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
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

interface MainLayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/create-test', icon: PenTool, label: 'Create Test' },
  { path: '/tests', icon: ClipboardList, label: 'My Tests' },
  { path: '/create-flashcards', icon: Layers, label: 'Create Flash Cards' },
  { path: '/flashcards', icon: BookOpen, label: 'My Flash Cards' },
  { path: '/tutor', icon: MessageCircle, label: 'AI Tutor' },
  { path: '/study-guide', icon: BookOpen, label: 'Study Guides' },
  { path: '/progress', icon: TrendingUp, label: 'Progress' },
]

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
  const [showDrawer, setShowDrawer] = useState(false)
  const location = useLocation()

  const handleLogout = async () => {
    setShowAccountMenu(false)
    await logout()
  }

  const isNavActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── DESKTOP SIDEBAR (lg+) ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-30 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Quiz Wiz AI</h1>
            <p className="text-[10px] text-gray-400 leading-tight">Smart Study Made Easy</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isNavActive(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group ${
                  active
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />}
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-screen lg:ml-64">

        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Hamburger: mobile only */}
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center lg:hidden">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <h1 className="text-lg font-bold text-sky-600 lg:hidden">Quiz Wiz AI</h1>

            {/* Desktop: show current page breadcrumb area */}
            <div className="hidden lg:block">
              <p className="text-sm text-gray-500">
                {navItems.find(i => isNavActive(i.path))?.label ?? 'Dashboard'}
              </p>
            </div>
          </div>

          {/* Account Icon (mobile) / User info (desktop) */}
          <div className="relative">
            {/* Mobile account button */}
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center hover:bg-sky-200 transition-colors lg:hidden"
            >
              <User className="w-5 h-5 text-sky-600" />
            </button>

            {/* Desktop: just a greeting */}
            <p className="hidden lg:block text-sm font-medium text-gray-700">
              Hi, {user?.name?.split(' ')[0]} 👋
            </p>

            {/* Account Dropdown (mobile) */}
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

        {/* Mobile Side Drawer */}
        <AnimatePresence>
          {showDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDrawer(false)}
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="fixed left-0 top-0 h-screen w-80 bg-white shadow-xl z-50 flex flex-col overflow-y-auto lg:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <nav className="flex-1 px-2 py-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isNavActive(item.path)
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowDrawer(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1"
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-sky-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${active ? 'text-sky-600' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                        {active && <div className="ml-auto w-1 h-6 bg-sky-500 rounded-r" />}
                      </NavLink>
                    )
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-8">
          <div className="p-4 lg:p-8 max-w-2xl lg:max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Bottom Nav — mobile only */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden">
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
                  <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-sky-100' : ''}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-sky-600' : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-sky-600' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
