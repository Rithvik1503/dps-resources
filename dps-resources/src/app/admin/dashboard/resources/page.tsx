'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Resource {
  id: number
  title: string
  description: string
  subject_id: number
  grade: number
  file_url: string
  file_name: string
  created_at: string
}

interface Subject {
  id: number
  name: string
  grade: number
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    grade: 9,
    file_url: '',
    file_name: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchResources()
    fetchSubjects()
  }, [])

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('grade', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch subjects')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFormData(prev => ({
        ...prev,
        file_name: selectedFile.name
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file && !editingResource) {
      setError('Please select a file')
      return
    }

    if (!formData.subject_id) {
      setError('Please select a subject')
      return
    }

    try {
      let fileUrl = formData.file_url

      if (file) {
        // Create a unique file name using timestamp and random string
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 8)
        const fileExt = file.name.split('.').pop()
        const fileName = `${timestamp}-${randomString}.${fileExt}`
        
        // Create a simpler path structure
        const filePath = fileName

        // If we're editing and there's an existing file, delete it first
        if (editingResource && editingResource.file_url) {
          const oldFileName = editingResource.file_url.split('/').pop()
          if (oldFileName) {
            try {
              const { error: deleteError } = await supabase.storage
                .from('resources')
                .remove([oldFileName])
              
              if (deleteError) {
                console.error('Error deleting old file:', deleteError)
              }
            } catch (error) {
              console.error('Error deleting old file:', error)
            }
          }
        }

        // Upload the new file
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('resources')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Failed to upload file: ${uploadError.message}`)
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath)

        fileUrl = publicUrl
      }

      // Create resource record
      const resourceData = {
        title: formData.title,
        description: formData.description,
        subject_id: formData.subject_id,
        grade: formData.grade,
        file_url: fileUrl,
        file_name: file ? file.name : formData.file_name,
      }

      console.log('Saving resource data:', resourceData)

      if (editingResource) {
        const { error, data } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', editingResource.id)
          .select()

        if (error) {
          console.error('Update error:', error)
          throw new Error(`Failed to update resource: ${error.message}`)
        }
        console.log('Update successful:', data)
      } else {
        const { error, data } = await supabase
          .from('resources')
          .insert([resourceData])
          .select()

        if (error) {
          console.error('Insert error:', error)
          throw new Error(`Failed to create resource: ${error.message}`)
        }
        console.log('Insert successful:', data)
      }

      setIsModalOpen(false)
      setEditingResource(null)
      setFormData({
        title: '',
        description: '',
        subject_id: '',
        grade: 9,
        file_url: '',
        file_name: '',
      })
      setFile(null)
      fetchResources()
    } catch (error) {
      console.error('Submit error:', error)
      setError(error instanceof Error ? error.message : 'Failed to save resource')
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      subject_id: resource.subject_id.toString(),
      grade: resource.grade,
      file_url: resource.file_url,
      file_name: resource.file_name,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const { error } = await supabase.from('resources').delete().eq('id', id)
      if (error) throw error
      fetchResources()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete resource')
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <button
          onClick={() => {
            setEditingResource(null)
            setFormData({
              title: '',
              description: '',
              subject_id: '',
              grade: 9,
              file_url: '',
              file_name: '',
            })
            setFile(null)
            setIsModalOpen(true)
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Resource
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {resources.map((resource) => (
            <li key={resource.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-indigo-600 truncate">
                      {resource.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {resource.description}
                    </p>
                    <div className="mt-1 text-sm text-gray-500">
                      Grade {resource.grade} •{' '}
                      {subjects.find((s) => s.id === resource.subject_id)?.name}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      File: {resource.file_name}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">
              {editingResource ? 'Edit Resource' : 'Add Resource'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="grade"
                  className="block text-sm font-medium text-gray-700"
                >
                  Grade
                </label>
                <select
                  id="grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value={9}>Grade 9</option>
                  <option value={10}>Grade 10</option>
                  <option value={11}>Grade 11</option>
                  <option value={12}>Grade 12</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  value={formData.subject_id}
                  onChange={(e) =>
                    setFormData({ ...formData, subject_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects
                    .filter((s) => s.grade === formData.grade)
                    .map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700"
                >
                  File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  required={!editingResource}
                />
                {editingResource && formData.file_name && (
                  <p className="mt-1 text-sm text-gray-500">
                    Current file: {formData.file_name}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingResource ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 