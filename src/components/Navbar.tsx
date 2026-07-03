'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, ShieldCheck, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'

export function Navbar() {
  const pathname = usePathname()

  const isHomePage = pathname === '/'
  const isWorkAuthPage = pathname === '/work-auth'
  const isDashboardPage = pathname === '/dashboard'

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

          <div className="flex gap-3">
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
          </div>
        </div>
      </div>
    </div>
  )
}
