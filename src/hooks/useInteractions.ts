import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Interaction {
  id: string
  contactId: string
  contactName: string
  company: string
  channel: 'Email' | 'LinkedIn'
  date: string
  stage: 'Cold' | 'Replied' | 'Call'
  preview: string
}

export function useInteractions() {
  const [data, setData] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: rows, error: err } = await supabase
        .from('outreach')
        .select(`
          id, contact_id, channel, date, stage, preview,
          contacts (name, companies (name))
        `)
        .order('date', { ascending: false })

      if (err) {
        setError(err.message)
      } else {
        setData(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (rows ?? []).map((row: any) => ({
            id: row.id,
            contactId: row.contact_id,
            contactName: row.contacts?.name ?? '',
            company: row.contacts?.companies?.name ?? '',
            channel: row.channel,
            date: row.date ?? '',
            stage: row.stage,
            preview: row.preview ?? '',
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
