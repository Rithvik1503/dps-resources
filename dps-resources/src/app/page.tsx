'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

interface Subject {
  id: string
  name: string
  grade: number
}

interface GradeSubjects {
  [key: number]: Subject[]
}

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <div className="min-h-[600px] bg-gradient-to-b from-purple-200 to-purple-100 flex flex-col items-center justify-center text-center px-4 py-16">
        <h1 className="text-6xl font-bold text-gray-900 mb-8 tracking-tight">
          Caring together,
          <br />
          growing better.
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mb-12">
          Supporting students with access to comprehensive, student-curated resources for Grades 9-12. Whether you missed a class or need to strengthen your understanding, we've got you covered.
        </p>
        <div className="w-full max-w-3xl">
          <SearchBar />
        </div>
      </div>

      {/* Resources by Grade Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Resources by Grade</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[9, 10, 11, 12].map((grade, index) => {
            const gradientColors = [
              'from-pink-300 to-purple-300', // Grade 9
              'from-yellow-200 to-yellow-100', // Grade 10
              'from-green-200 to-green-100', // Grade 11
              'from-blue-200 to-blue-100', // Grade 12
            ]

            const subjects = {
              9: ['Mathematics', 'Science', 'Telugu', '+4 more subjects'],
              10: ['Mathematics', 'Science', 'Telugu', '+4 more subjects'],
              11: ['Economics', 'Mathematics', 'Physics', '+4 more subjects'],
              12: ['Economics', 'Mathematics', 'Physics', '+4 more subjects'],
            }

            return (
              <div
                key={grade}
                className={`rounded-3xl p-6 bg-gradient-to-br ${gradientColors[index]} shadow-sm hover:shadow-md transition-shadow`}
              >
                <h3 className="text-4xl font-bold text-white mb-6">Grade {grade}</h3>
                <ul className="space-y-2 mb-8">
                  {subjects[grade as keyof typeof subjects].map((subject, i) => (
                    <li key={i} className="text-white/90">{subject}</li>
                  ))}
                </ul>
                <a
                  href={`/grade/${grade}`}
                  className="inline-flex items-center px-4 py-2 bg-white/90 rounded-full text-sm font-medium text-gray-900 hover:bg-white transition-colors"
                >
                  View Resources
                </a>
              </div>
            )
          })}
        </div>
      </div>

      {/* Why Choose Our Platform Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16 hover:scale-105 transition-transform duration-300">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Comprehensive Resources */}
            <div className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:bg-white/80 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl cursor-pointer">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:bg-purple-200 transition-all duration-300">
                <svg 
                  className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Comprehensive Resources
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                Access a wide range of study materials, from notes to previous year questions.
              </p>
            </div>

            {/* Well-Organized Content */}
            <div className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:bg-white/80 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-300">
                <svg 
                  className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Well-Organized Content
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                Find exactly what you need with our grade and subject-based organization.
              </p>
            </div>

            {/* Community Driven */}
            <div className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:bg-white/80 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl cursor-pointer">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:bg-green-200 transition-all duration-300">
                <svg 
                  className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                Community Driven
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                Benefit from resources contributed by teachers and top students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
