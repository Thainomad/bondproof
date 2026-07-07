import { createClient } from '@/lib/supabase/server'

export async function getRule<T = Record<string, unknown>>(
  state: string,
  key: string
): Promise<{ value: T; citation: string; version: number } | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rules')
    .select('value_json, citation, version')
    .eq('state', state)
    .eq('key', key)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return { value: data.value_json as T, citation: data.citation, version: data.version }
}
