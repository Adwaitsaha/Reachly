import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Reminder {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  category: 'follow-up' | 'application' | 'interview' | 'task'
}

export function useReminders() {
  const [data, setData] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: rows, error: err } = await supabase
      .from('reminders')
      .select('id, title, description, due_date, priority, category')
      .eq('completed', false)
      .order('due_date', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setData(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rows ?? []).map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description ?? '',
          dueDate: row.due_date ?? '',
          priority: row.priority,
          category: row.category,
        }))
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** Mark a reminder complete — removes it from the list immediately. */
  const markComplete = async (id: string): Promise<void> => {
    const { error: err } = await supabase
      .from('reminders')
      .update({ completed: true })
      .eq('id', id)
    if (err) throw err
    setData(prev => prev.filter(r => r.id !== id))
  }

  /**
   * Push the due date forward by `days` (default 1).
   * If no due date is set, snoozes from today.
   */
  const snooze = async (id: string, days = 1): Promise<void> => {
    const reminder = data.find(r => r.id === id)
    if (!reminder) return

    const base = reminder.dueDate
      ? new Date(reminder.dueDate + 'T00:00:00')
      : new Date()
    base.setDate(base.getDate() + days)
    const newDueDate = base.toISOString().split('T')[0]

    const { error: err } = await supabase
      .from('reminders')
      .update({ due_date: newDueDate })
      .eq('id', id)
    if (err) throw err

    setData(prev => prev.map(r => r.id === id ? { ...r, dueDate: newDueDate } : r))
  }

  return { data, loading, error, markComplete, snooze }
}
