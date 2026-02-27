import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Resume {
  id: string
  name: string
  lastUsed: string
  jobsSentTo: string[]
  dateCreated: string
  fileUrl?: string   // Supabase Storage path — undefined for records without a file
}

export function useResumes() {
  const [data, setData] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: rows, error: err } = await supabase
      .from('resumes')
      .select(`
        id, name, last_used, date_created, file_url,
        jobs (role, companies (name))
      `)
      .order('last_used', { ascending: false, nullsFirst: false })

    if (err) {
      setError(err.message)
    } else {
      setData(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rows ?? []).map((row: any) => ({
          id: row.id,
          name: row.name,
          lastUsed: row.last_used ?? '',
          dateCreated: row.date_created ?? '',
          fileUrl: row.file_url ?? undefined,
          jobsSentTo: (row.jobs ?? []).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (j: any) => `${j.companies?.name ?? ''} ${j.role}`.trim()
          ),
        }))
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** Upload a file to Supabase Storage and create a resumes DB record. */
  const upload = async (file: File, name: string): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user.id
    if (!userId) throw new Error('Not authenticated')

    const path = `${userId}/${Date.now()}-${file.name}`

    const { error: storageErr } = await supabase.storage
      .from('resumes')
      .upload(path, file)
    if (storageErr) throw storageErr

    const today = new Date().toISOString().split('T')[0]
    const { error: dbErr } = await supabase.from('resumes').insert({
      user_id: userId,
      name,
      file_url: path,
      date_created: today,
      last_used: today,
    })
    if (dbErr) throw dbErr

    await load()
  }

  /** Rename a resume record (display name only, does not move the file). */
  const rename = async (id: string, name: string): Promise<void> => {
    const { error: err } = await supabase
      .from('resumes')
      .update({ name })
      .eq('id', id)
    if (err) throw err
    setData(prev => prev.map(r => r.id === id ? { ...r, name } : r))
  }

  /** Delete the DB record and remove the file from Storage if one exists. */
  const remove = async (id: string): Promise<void> => {
    const resume = data.find(r => r.id === id)

    const { error: err } = await supabase.from('resumes').delete().eq('id', id)
    if (err) throw err

    if (resume?.fileUrl) {
      // Best-effort — don't fail the whole operation if storage remove fails
      await supabase.storage.from('resumes').remove([resume.fileUrl])
    }

    setData(prev => prev.filter(r => r.id !== id))
  }

  /** Return a 1-hour signed URL for viewing or downloading a stored file. */
  const getSignedUrl = async (fileUrl: string): Promise<string | null> => {
    const { data: urlData, error: err } = await supabase.storage
      .from('resumes')
      .createSignedUrl(fileUrl, 3600)
    if (err) return null
    return urlData.signedUrl
  }

  return { data, loading, error, upload, rename, remove, getSignedUrl }
}
