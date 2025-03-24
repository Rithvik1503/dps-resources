import { supabase } from './supabase'
import type { User, Resource, Subject } from './supabase'

// User functions
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as User
}

export async function createUser(user: Omit<User, 'created_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single()

  if (error) throw error
  return data as User
}

// Subject functions
export async function getSubjects(grade?: number) {
  let query = supabase.from('subjects').select('*')
  
  if (grade) {
    query = query.eq('grade', grade)
  }

  const { data, error } = await query.order('name')
  
  if (error) throw error
  return data as Subject[]
}

export async function createSubject(subject: Omit<Subject, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('subjects')
    .insert([subject])
    .select()
    .single()

  if (error) throw error
  return data as Subject
}

// Resource functions
export async function getResources(grade?: number, subjectId?: string) {
  let query = supabase
    .from('resources')
    .select(`
      *,
      subject:subjects(*)
    `)
  
  if (grade) {
    query = query.eq('grade', grade)
  }
  
  if (subjectId) {
    query = query.eq('subject_id', subjectId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data as (Resource & { subject: Subject })[]
}

export async function createResource(resource: Omit<Resource, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('resources')
    .insert([resource])
    .select()
    .single()

  if (error) throw error
  return data as Resource
}

export async function deleteResource(id: string) {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)

  if (error) throw error
} 