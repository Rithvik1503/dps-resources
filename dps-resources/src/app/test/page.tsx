'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject } from '@/lib/supabase';

export default function TestPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('grade, name');

        if (error) throw error;
        setSubjects(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }

    fetchSubjects();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
      <h2 className="text-xl font-semibold mb-2">Subjects:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-4 border rounded-lg">
            <h3 className="font-medium">{subject.name}</h3>
            <p className="text-gray-600">Grade {subject.grade}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 