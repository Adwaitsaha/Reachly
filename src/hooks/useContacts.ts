import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Contact {
  id: string
  name: string
  role: string
  company: string
  companyId: string
  email: string
  linkedin: string
  avatar: string
  tags: string[]
  lastContacted: string
  relationshipStage: 'Active' | 'Warm' | 'Cold'
  notes: string
}

export function useContacts() {
  const [data, setData] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: rows, error: err } = await supabase
        .from('contacts')
        .select(`
          id, name, role, email, linkedin, avatar_url,
          relationship_stage, last_contacted, notes,
          companies (id, name),
          contact_tags (tag)
        `)
        .order('created_at', { ascending: false })

      if (err) {
        setError(err.message)
      } else {
        setData(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (rows ?? []).map((row: any) => ({
            id: row.id,
            name: row.name,
            role: row.role ?? '',
            company: row.companies?.name ?? '',
            companyId: row.companies?.id ?? '',
            email: row.email ?? '',
            linkedin: row.linkedin ?? '',
            avatar: row.avatar_url ?? '',
            tags: (row.contact_tags ?? []).map((t: { tag: string }) => t.tag),
            lastContacted: row.last_contacted ?? '',
            relationshipStage: row.relationship_stage ?? 'Cold',
            notes: row.notes ?? '',
          }))
        )
      }
      setLoading(false)
    }

    load()
    window.addEventListener('reachly:data-refreshed', load)
    return () => window.removeEventListener('reachly:data-refreshed', load)
  }, [])

  return { data, loading, error }
}
