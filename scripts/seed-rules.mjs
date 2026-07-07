// Upserts data/rules.nsw.json into the rules table, keyed on (state, key).
// Re-running this after updating the JSON creates a new version row rather
// than silently overwriting history — see the `rules` table's versioning.
//
// Usage: node scripts/seed-rules.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const rules = JSON.parse(readFileSync(path.join(root, 'data', 'rules.nsw.json'), 'utf8'))

for (const rule of rules) {
  const { data: existing } = await supabase
    .from('rules')
    .select('id, version')
    .eq('state', rule.state)
    .eq('key', rule.key)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing && existing.version >= rule.version) {
    console.log(`Skipping ${rule.key} v${rule.version} (already have v${existing.version})`)
    continue
  }

  const { error } = await supabase.from('rules').insert(rule)
  if (error) {
    console.error(`Failed to insert ${rule.key}:`, error.message)
    process.exit(1)
  }
  console.log(`Inserted ${rule.key} v${rule.version}`)
}
