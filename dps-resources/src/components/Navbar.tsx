'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            DPS Resources
          </Link>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/admin/dashboard/subjects" className="text-gray-600 hover:text-gray-900">
                  Subjects
                </Link>
                <Link href="/admin/dashboard/resources" className="text-gray-600 hover:text-gray-900">
                  Resources
                </Link>
              </>
            ) : (
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                Admin
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 