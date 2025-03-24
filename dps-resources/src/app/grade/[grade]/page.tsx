'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Subject {
  id: string
  name: string
  grade: number
}

export default function GradePage() {
  const params = useParams()
  const grade = parseInt(params.grade as string)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (grade >= 9 && grade <= 12) {
      fetchSubjects()
    } else {
      setError('Invalid grade')
      setLoading(false)
    }
  }, [grade])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('grade', grade)
        .order('name', { ascending: true })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: number) => {
    const colors = {
      9: 'bg-blue-50 text-blue-700',
      10: 'bg-green-50 text-green-700',
      11: 'bg-purple-50 text-purple-700',
      12: 'bg-orange-50 text-orange-700',
    }
    return colors[grade as keyof typeof colors] || 'bg-gray-50 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchSubjects}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-900"
            >
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${getGradeColor(grade)}`}>
              Grade {grade} Resources
            </h1>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/grade/${grade}/subject/${subject.id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {subject.name}
              </h2>
              <p className="text-gray-600">
                Access study materials, PYQs, and project resources for {subject.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} DPS Resources. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 