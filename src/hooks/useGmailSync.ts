import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

interface SyncResult {
  synced: number
  contactsCreated: number
  skipped: number
}

export function useGmailSync() {
  const { session } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sync = async () => {
    if (!session?.provider_token) {
      setError('Re-authenticate with Google to enable Gmail sync')
      return
    }

    setSyncing(true)
    setError(null)

    // Get a fresh session so we never send an expired Supabase JWT
    const { data: { session: freshSession } } = await supabase.auth.getSession()
    if (!freshSession) {
      setError('Session expired — please sign out and sign back in with Google')
      setSyncing(false)
      return
    }

    // provider_token is not persisted after page refresh; fall back to React state
    const providerToken = freshSession.provider_token ?? session.provider_token

    let data: SyncResult | null = null
    let fnErr: string | null = null

    try {
      // Use fetch directly — supabase.functions.invoke can override the
      // Authorization header with the anon key in some versions
      const res = await fetch(`${SUPABASE_URL}/functions/v1/gmail-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshSession.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ provider_token: providerToken }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        const raw: string = json?.error ?? json?.message ?? `Request failed (${res.status})`
        // Surface a clear message when the Google OAuth token has expired
        fnErr = raw.includes('401') || raw.includes('invalid_grant') || raw.includes('Invalid Credentials')
          ? 'Google access token expired — please sign out and sign back in with Google'
          : raw
      } else {
        data = json as SyncResult
      }
    } catch (err) {
      fnErr = err instanceof Error ? err.message : 'Network error'
    }

    if (fnErr) {
      setError(fnErr)
    } else if (data) {
      setResult(data)
      // Signal data hooks to refetch so new contacts/outreach appear immediately
      window.dispatchEvent(new CustomEvent('reachly:data-refreshed'))
    }

    setSyncing(false)
    return data ?? undefined
  }

  return {
    sync,
    syncing,
    result,
    error,
    hasGoogleToken: !!session?.provider_token,
  }
}
