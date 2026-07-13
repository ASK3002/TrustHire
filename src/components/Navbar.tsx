'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const isHomePage = pathname === '/'
  const isWorkAuthPage = pathname === '/work-auth'
  const isDashboardPage = pathname === '/dashboard'

  const getUserInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'User'
  }

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/images.png"
              alt="TrustHire Logo"
              width={80}
              height={80}
              className="rounded-full object-contain"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                TrustHire
              </h1>
              <p className="text-gray-600 text-sm leading-tight">
                Real-Time AI Hiring Intelligence & Verification Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isHomePage && (
              <Link
                href="/"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Analyze New Candidate
              </Link>
            )}

            {!isDashboardPage && (
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            {!isWorkAuthPage && (
              <Link
                href="/work-auth"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Work Exp Auth
              </Link>
            )}

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg flex items-center justify-center hover:shadow-lg transition"
                >
                  {getUserInitial()}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{getDisplayName()}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
