import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Company {
  id: string
  name: string
  logo: string
  industry: string
  location: string
  careersLink: string
  contactCount: number
  jobsApplied: number
}

export function useCompanies() {
  const [data, setData] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: rows, error: err } = await supabase
        .from('companies')
        .select(`
          id, name, logo_url, industry, location, careers_link,
          contacts (id),
          jobs (id)
        `)
        .order('name')

      if (err) {
        setError(err.message)
      } else {
        setData(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (rows ?? []).map((row: any) => ({
            id: row.id,
            name: row.name,
            logo: row.logo_url ?? '',
            industry: row.industry ?? '',
            location: row.location ?? '',
            careersLink: row.careers_link ?? '',
            // compute from join counts instead of storing stale values
            contactCount: (row.contacts ?? []).length,
            jobsApplied: (row.jobs ?? []).length,
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading, error }
}
