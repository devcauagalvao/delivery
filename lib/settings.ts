import { supabase } from './supabase'

let cached: { data: any; ts: number } | null = null
const TTL = 1000 * 60 * 10 // 10 min

export async function getSettings() {
  const now = Date.now()
  if (cached && now - cached.ts < TTL) return cached.data

  try {
    const { data, error } = await supabase.from('app_settings').select('*').limit(1).maybeSingle()
    if (error) throw error
    cached = { data, ts: Date.now() }
    return data
  } catch (err) {
    console.error('getSettings error', err)
    throw err
  }
}
