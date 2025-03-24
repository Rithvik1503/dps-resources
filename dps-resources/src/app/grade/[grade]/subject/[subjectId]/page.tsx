'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Resource {
  id: number
  title: string
  description: string
  subject_id: string
  grade: number
  file_url: string
  file_name: string
  created_at: string
  category: 'notes' | 'pyqs' | 'projects'
}

interface Subject {
  id: string
  name: string
  grade: number
}

type Category = 'notes' | 'pyqs' | 'projects'

export default function SubjectPage() {
  const params = useParams()
  const grade = parseInt(params.grade as string)
  const subjectId = params.subjectId as string
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category>('notes')
  const [previewResource, setPreviewResource] = useState<Resource | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (grade >= 9 && grade <= 12) {
      fetchSubject()
      fetchResources()
    } else {
      setError('Invalid grade')
      setLoading(false)
    }
  }, [grade, subjectId])

  useEffect(() => {
    setFilteredResources(resources.filter(r => r.category === selectedCategory))
  }, [selectedCategory, resources])

  const fetchSubject = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single()

      if (error) throw error
      setSubject(data)
    } catch (error) {
      console.error('Error fetching subject:', error)
    }
  }

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('grade', grade)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch resources')
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

  const getCategoryColor = (category: Category) => {
    const colors = {
      notes: 'bg-blue-100 text-blue-800',
      pyqs: 'bg-green-100 text-green-800',
      projects: 'bg-purple-100 text-purple-800',
    }
    return colors[category]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isPDF = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.pdf')
  }

  const handlePreview = (resource: Resource) => {
    if (isPDF(resource.file_name)) {
      setPreviewResource(resource)
    }
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
            onClick={fetchResources}
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
              href={`/grade/${grade}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              ← Back to Grade {grade}
            </Link>
            <h1 className={`text-3xl font-bold ${getGradeColor(grade)}`}>
              {subject?.name || 'Subject'} Resources
            </h1>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {(['notes', 'pyqs', 'projects'] as Category[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedCategory === category
                    ? `${getCategoryColor(category)} border-current`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category === 'pyqs' ? 'PYQs' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No {selectedCategory} available</h3>
            <p className="mt-2 text-gray-500">
              There are currently no {selectedCategory} available for this subject.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white shadow-sm rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {resource.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(resource.category)}`}>
                          {resource.category === 'pyqs' ? 'PYQs' : resource.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {resource.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {isPDF(resource.file_name) && (
                        <button
                          onClick={() => handlePreview(resource)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Preview
                        </button>
                      )}
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>File: {resource.file_name}</span>
                    <span className="mx-2">•</span>
                    <span>Added on {formatDate(resource.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {previewResource.title}
                      </h3>
                      <button
                        onClick={() => setPreviewResource(null)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2 h-[600px]">
                      <iframe
                        src={`${previewResource.file_url}#toolbar=0`}
                        className="w-full h-full"
                        title={previewResource.title}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <a
                  href={previewResource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewResource(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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