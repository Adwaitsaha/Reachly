import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Job {
  id: string
  role: string
  company: string
  companyId: string
  companyLogo: string
  source: string
  status: 'Applied' | 'Interview' | 'Offer'
  resumeUsed: string
  dateApplied: string
  contacts: string[]
  location: string
  salary: string
}

export function useJobs() {
  const [data, setData] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: rows, error: err } = await supabase
        .from('jobs')
        .select(`
          id, role, source, status, date_applied, location, salary_range,
          companies (id, name, logo_url),
          resumes (name),
          job_contacts (contacts (name))
        `)
        .order('date_applied', { ascending: false })

      if (err) {
        setError(err.message)
      } else {
        setData(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (rows ?? []).map((row: any) => ({
            id: row.id,
            role: row.role,
            company: row.companies?.name ?? '',
            companyId: row.companies?.id ?? '',
            companyLogo: row.companies?.logo_url ?? '',
            source: row.source ?? '',
            status: row.status,
            resumeUsed: row.resumes?.name ?? '',
            dateApplied: row.date_applied ?? '',
            contacts: (row.job_contacts ?? [])
              .map((jc: any) => jc.contacts?.name ?? '')
              .filter(Boolean),
            location: row.location ?? '',
            salary: row.salary_range ?? '',
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading, error }
}
