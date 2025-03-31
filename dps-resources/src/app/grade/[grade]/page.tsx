'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Subject {
  id: string
  name: string
  subject_type: string
  grade: number
  resource_count: number
  category?: string // Added for UI purposes after transformation
}

interface SubjectsByCategory {
  [key: string]: Subject[]
}

export default function GradePage({ params }: { params: { grade: string } }) {
  const [subjects, setSubjects] = useState<SubjectsByCategory>({})
  const [loading, setLoading] = useState(true)
  const grade = parseInt(params.grade)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSubjects()
  }, [grade])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          resources:resources(count)
        `)
        .eq('grade', grade)
        .order('name')

      if (error) throw error

      // Transform the data to include resource_count
      const transformedData = data.map(subject => ({
        ...subject,
        resource_count: subject.resources?.[0]?.count || 0
      }))

      // Group subjects by category (using subject type as category)
      const groupedSubjects = transformedData.reduce((acc: SubjectsByCategory, subject) => {
        // Use subject_type as category
        const category = subject.subject_type?.toUpperCase() || 'OTHER'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push({
          ...subject,
          category // Add category to the subject object
        })
        return acc
      }, {})

      setSubjects(groupedSubjects)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'SCIENCE': 'bg-gradient-to-br from-orange-400 via-orange-300 to-orange-500 hover:from-orange-500 hover:via-orange-400 hover:to-orange-600',
      'LANGUAGE': 'bg-gradient-to-br from-pink-400 via-pink-300 to-pink-500 hover:from-pink-500 hover:via-pink-400 hover:to-pink-600',
      'HUMANITIES': 'bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 hover:from-purple-500 hover:via-purple-400 hover:to-purple-600',
      'COMMERCE': 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500 hover:from-blue-500 hover:via-blue-400 hover:to-blue-600',
      'OTHER': 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 hover:from-gray-500 hover:via-gray-400 hover:to-gray-600'
    }
    return gradients[category] || gradients['OTHER']
  }

  const getGradeGradient = (grade: number) => {
    const gradients = {
      9: 'from-pink-400 via-purple-300 to-purple-500',
      10: 'from-yellow-300 via-amber-200 to-orange-400',
      11: 'from-emerald-400 via-green-300 to-teal-500',
      12: 'from-blue-400 via-cyan-300 to-indigo-500',
    }
    return gradients[grade as keyof typeof gradients] || 'from-gray-300 via-gray-200 to-gray-400'
  }

  const getTotalSubjects = () => {
    return Object.values(subjects).reduce((total, categorySubjects) => total + categorySubjects.length, 0)
  }

  const getTotalResources = () => {
    return Object.values(subjects).reduce((total, categorySubjects) => {
      return total + categorySubjects.reduce((catTotal, subject) => catTotal + (subject.resource_count || 0), 0)
    }, 0)
  }

  if (loading) {
    return (
      <div className="animate-pulse min-h-screen">
        <div className={`bg-gradient-to-b ${getGradeGradient(grade)} py-12`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-12 bg-white/20 rounded-lg w-1/4 mb-4"></div>
            <div className="h-6 bg-white/20 rounded-lg w-1/3"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-12">
              <div className="h-8 bg-gray-200 rounded w-1/6 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-48 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-br ${getGradeGradient(grade)} py-16 relative overflow-hidden transition-all duration-500`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-md">Grade {grade}</h1>
          <p className="text-lg text-white/90 backdrop-blur-sm inline-block px-4 py-2 rounded-full bg-black/10">
            {getTotalSubjects()} Subjects • {getTotalResources()} Resources
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        {Object.entries(subjects).map(([category, categorySubjects]) => (
          <div key={category} className="mb-12 last:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className={`w-2 h-8 rounded-full mr-3 ${getCategoryGradient(category)}`}></span>
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorySubjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`${getCategoryGradient(category)} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative">
                    <div className="text-sm font-medium text-white/90 mb-2">{category}</div>
                    <h3 className="text-2xl font-bold mb-4">{subject.name}</h3>
                    <div className="text-sm text-white/90">Grade {grade}</div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        {subject.resource_count || 0} Resources
                      </span>
                      <a
                        href={`/grade/${grade}/subject/${subject.id}`}
                        className="inline-flex items-center px-5 py-2.5 bg-white/20 rounded-full text-sm font-medium text-white hover:bg-white/30 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm"
                      >
                        View Resources
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 