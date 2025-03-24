'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface Subject {
  id: string
  name: string
  grade: number
}

interface GradeSubjects {
  [key: number]: Subject[]
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<GradeSubjects>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('grade', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      // Group subjects by grade
      const groupedSubjects = data.reduce((acc: GradeSubjects, subject) => {
        if (!acc[subject.grade]) {
          acc[subject.grade] = []
        }
        acc[subject.grade].push(subject)
        return acc
      }, {})

      setSubjects(groupedSubjects)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: number) => {
    const colors = {
      9: 'bg-blue-50 hover:bg-blue-100',
      10: 'bg-green-50 hover:bg-green-100',
      11: 'bg-purple-50 hover:bg-purple-100',
      12: 'bg-orange-50 hover:bg-orange-100',
    }
    return colors[grade as keyof typeof colors] || 'bg-gray-50 hover:bg-gray-100'
  }

  const getGradeTextColor = (grade: number) => {
    const colors = {
      9: 'text-blue-700',
      10: 'text-green-700',
      11: 'text-purple-700',
      12: 'text-orange-700',
    }
    return colors[grade as keyof typeof colors] || 'text-gray-700'
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
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              DPS Resources
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Caring together, growing better
            </p>
            <p className="mt-4 text-lg text-gray-600">
              Supporting students with access to comprehensive, student-curated resources
            </p>
          </div>
        </div>
      </div>

      {/* Grade Selection */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[9, 10, 11, 12].map((grade) => (
            <Link
              key={grade}
              href={`/grade/${grade}`}
              className={`block p-6 rounded-lg shadow-sm transition-colors duration-200 ${getGradeColor(grade)}`}
            >
              <div className="text-center">
                <h2 className={`text-2xl font-bold mb-4 ${getGradeTextColor(grade)}`}>
                  Grade {grade}
                </h2>
                <div className="space-y-2">
                  {subjects[grade]?.slice(0, 3).map((subject) => (
                    <div
                      key={subject.id}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {subject.name}
                    </div>
                  ))}
                  {subjects[grade]?.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{subjects[grade].length - 3} more subjects
                    </div>
                  )}
                </div>
              </div>
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
