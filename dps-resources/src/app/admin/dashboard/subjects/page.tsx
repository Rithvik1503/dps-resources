'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Subject {
  id: number
  name: string
  grade: number
  created_at: string
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    grade: 9,
  })
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
      setSubjects(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(formData)
          .eq('id', editingSubject.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('subjects').insert([formData])
        if (error) throw error
      }

      setIsModalOpen(false)
      setEditingSubject(null)
      setFormData({ name: '', grade: 9 })
      fetchSubjects()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save subject')
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      grade: subject.grade,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id)
      if (error) throw error
      fetchSubjects()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete subject')
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Subjects</h1>
        <button
          onClick={() => {
            setEditingSubject(null)
            setFormData({ name: '', grade: 9 })
            setIsModalOpen(true)
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Subject
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {subject.name}
                    </p>
                    <p className="ml-2 text-sm text-gray-500">
                      Grade {subject.grade}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
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
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  {editingSubject ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 