// Upserts data/checklist-items.nsw.json into the checklist_items table,
// keyed on the stable `slug` field so re-running this is idempotent.
//
// Usage: node scripts/seed-checklist.mjs

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

const items = JSON.parse(
  readFileSync(path.join(root, 'data', 'checklist-items.nsw.json'), 'utf8')
)

const { data, error } = await supabase
  .from('checklist_items')
  .upsert(items, { onConflict: 'slug' })
  .select('slug')

if (error) {
  console.error('Seed failed:', error)
  process.exit(1)
}

console.log(`Seeded ${data.length} checklist items.`)
