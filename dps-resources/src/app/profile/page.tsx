'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  bio: string
  grade: number
  updated_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setSaving(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-8 divide-y divide-gray-200">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                <div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      This information will be displayed publicly.
                    </p>
                  </div>

                  <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Photo
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden">
                            <Image
                              src={profile?.avatar_url || '/placeholder-avatar.png'}
                              alt="Profile"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Full name
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <input
                          type="text"
                          name="full_name"
                          id="full_name"
                          value={profile?.full_name || ''}
                          onChange={(e) => updateProfile({ full_name: e.target.value })}
                          className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Email
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={profile?.email || ''}
                          disabled
                          className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Grade
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <select
                          id="grade"
                          name="grade"
                          value={profile?.grade || ''}
                          onChange={(e) => updateProfile({ grade: parseInt(e.target.value) })}
                          className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="">Select grade</option>
                          {[9, 10, 11, 12].map((grade) => (
                            <option key={grade} value={grade}>
                              Grade {grade}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Bio
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          value={profile?.bio || ''}
                          onChange={(e) => updateProfile({ bio: e.target.value })}
                          className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                        />
                        <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 