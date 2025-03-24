'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface StatsData {
  totalResources: number
  totalUsers: number
  resourcesByGrade: {
    [key: number]: number
  }
  resourcesByCategory: {
    [key: string]: number
  }
  recentUploads: {
    title: string
    grade: number
    created_at: string
  }[]
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData>({
    totalResources: 0,
    totalUsers: 0,
    resourcesByGrade: {},
    resourcesByCategory: {},
    recentUploads: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total resources
      const { count: resourceCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })

      // Fetch total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch resources by grade
      const { data: gradeData } = await supabase
        .from('resources')
        .select('grade')
      
      const gradeStats = gradeData?.reduce((acc: { [key: number]: number }, curr) => {
        acc[curr.grade] = (acc[curr.grade] || 0) + 1
        return acc
      }, {})

      // Fetch resources by category
      const { data: categoryData } = await supabase
        .from('resources')
        .select('category')
      
      const categoryStats = categoryData?.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1
        return acc
      }, {})

      // Fetch recent uploads
      const { data: recentData } = await supabase
        .from('resources')
        .select('title, grade, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalResources: resourceCount || 0,
        totalUsers: userCount || 0,
        resourcesByGrade: gradeStats || {},
        resourcesByCategory: categoryStats || {},
        recentUploads: recentData || []
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Resources</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.totalResources}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Most Active Grade</dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {Object.entries(stats.resourcesByGrade).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Most Common Category</dt>
                  <dd className="text-3xl font-semibold text-gray-900 capitalize">
                    {Object.entries(stats.resourcesByCategory).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Resources by Grade */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Resources by Grade</h3>
            <div className="mt-5">
              {Object.entries(stats.resourcesByGrade).map(([grade, count]) => (
                <div key={grade} className="mt-3 first:mt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Grade {grade}</div>
                    <div className="text-sm font-semibold text-gray-900">{count}</div>
                  </div>
                  <div className="mt-1">
                    <div className="overflow-hidden bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-indigo-600 rounded-full"
                        style={{
                          width: `${(count / stats.totalResources) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Uploads</h3>
            <div className="mt-5">
              <div className="flow-root">
                <ul className="-my-4 divide-y divide-gray-200">
                  {stats.recentUploads.map((upload, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{upload.title}</p>
                          <p className="text-sm text-gray-500">Grade {upload.grade}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(upload.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 