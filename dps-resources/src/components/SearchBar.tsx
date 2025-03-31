'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'resource' | 'subject'
  category?: string
  grade: number
  subject_name?: string
  subject_id?: string
  file_type?: string
  created_at: string
}

interface Subject {
  id: string
  name: string
  grade: number
  subject_type: string
  created_at: string
}

interface Resource {
  id: string
  title: string
  description: string
  category: string
  grade: number
  file_url: string
  created_at: string
  subject: {
    name: string
    id: string
  }
}

interface SearchFilters {
  grades: number[]
  categories: string[]
  dateRange: {
    start: string | null
    end: string | null
  }
  fileTypes: string[]
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    grades: [],
    categories: [],
    dateRange: {
      start: null,
      end: null
    },
    fileTypes: []
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        performSearch()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, filters])

  const performSearch = async () => {
    setIsLoading(true)
    try {
      // Search in resources
      const resourceQuery = supabase
        .from('resources')
        .select(`
          id,
          title,
          description,
          category,
          grade,
          file_url,
          created_at,
          subject:subjects!inner(
            name,
            id
          )
        `)
        .textSearch('title', query)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.grades.length > 0) {
        resourceQuery.in('grade', filters.grades)
      }
      if (filters.categories.length > 0) {
        resourceQuery.in('category', filters.categories)
      }
      if (filters.dateRange.start) {
        resourceQuery.gte('created_at', filters.dateRange.start)
      }
      if (filters.dateRange.end) {
        resourceQuery.lte('created_at', filters.dateRange.end)
      }
      if (filters.fileTypes.length > 0) {
        const fileTypeConditions = filters.fileTypes.map(type => `file_url.ilike('%${type}%')`).join(' or ')
        resourceQuery.or(fileTypeConditions)
      }

      const { data: resourceData, error: resourceError } = await resourceQuery

      // Search in subjects
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .textSearch('name', query)
        .order('name')

      if (resourceError || subjectError) throw resourceError || subjectError

      // Combine and format results
      const formattedResults: SearchResult[] = [
        ...(resourceData?.map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          description: resource.description,
          type: 'resource' as const,
          category: resource.category,
          grade: resource.grade,
          subject_name: resource.subject?.name,
          subject_id: resource.subject?.id,
          file_type: resource.file_url.split('.').pop(),
          created_at: resource.created_at
        })) || []),
        ...(subjectData?.map((subject: Subject) => ({
          id: subject.id,
          title: subject.name,
          description: `Grade ${subject.grade} - ${subject.subject_type}`,
          type: 'subject' as const,
          grade: subject.grade,
          created_at: subject.created_at
        })) || [])
      ]

      setResults(formattedResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'subject') {
      router.push(`/grade/${result.grade}/subject/${result.id}`)
    } else {
      router.push(`/grade/${result.grade}/subject/${result.subject_id}?resource=${result.id}`)
    }
  }

  const toggleFilter = (type: keyof SearchFilters, value: any) => {
    setFilters(prev => {
      if (type === 'dateRange') {
        return { ...prev, dateRange: value }
      }
      
      const array = prev[type] as any[]
      const index = array.indexOf(value)
      
      if (index === -1) {
        return { ...prev, [type]: [...array, value] }
      }
      
      return { ...prev, [type]: array.filter((_, i) => i !== index) }
    })
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources, subjects..."
            className="w-full px-4 py-3 pl-10 pr-12 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isLoading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`ml-2 p-3 rounded-lg border ${
            showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute z-20 w-full mt-2 p-4 bg-white rounded-lg shadow-lg border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Grade Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Grade</h3>
              <div className="space-y-2">
                {[9, 10, 11, 12].map((grade) => (
                  <label key={grade} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.grades.includes(grade)}
                      onChange={() => toggleFilter('grades', grade)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Grade {grade}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
              <div className="space-y-2">
                {['notes', 'pyqs', 'projects'].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleFilter('categories', category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 capitalize">
                      {category === 'pyqs' ? 'PYQs' : category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => toggleFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="w-full text-sm border rounded px-2 py-1.5"
                />
                <input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => toggleFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="w-full text-sm border rounded px-2 py-1.5"
                />
              </div>
            </div>

            {/* File Type Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">File Type</h3>
              <div className="space-y-2">
                {['pdf', 'doc', 'docx', 'ppt', 'pptx'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.fileTypes.includes(type)}
                      onChange={() => toggleFilter('fileTypes', type)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 uppercase">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 hover:bg-gray-50 flex items-start border-b last:border-b-0"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                {result.type === 'resource' ? (
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    result.category === 'notes' 
                      ? 'bg-blue-100 text-blue-600'
                      : result.category === 'pyqs'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{result.title}</div>
                <div className="text-sm text-gray-500">{result.description}</div>
                <div className="mt-1 flex items-center text-xs text-gray-400 space-x-2">
                  <span>Grade {result.grade}</span>
                  {result.type === 'resource' && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{result.category}</span>
                      {result.subject_name && (
                        <>
                          <span>•</span>
                          <span>{result.subject_name}</span>
                        </>
                      )}
                      {result.file_type && (
                        <>
                          <span>•</span>
                          <span className="uppercase">{result.file_type}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 