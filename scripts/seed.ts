import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  const dataPath = path.join(process.cwd(), 'data', 'properties.json')
  const properties = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  if (!Array.isArray(properties)) {
    throw new Error('properties.json must contain an array')
  }

  const validFields = [
    'property_name','date_acquired','original_investment_thesis','owners_intent_10yr',
    'general_notes','occupancy_rate','market_psf_rate','avg_psf_rate','leasing_strategy',
    'vacancies','tenant_mix','renewals','risks','capex_budget','capex_outlook_summary','long_term_items'
  ]
  const cleaned = properties.map((p: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(p).filter(([k]) => validFields.includes(k)))
  )

  console.log(`Seeding ${cleaned.length} properties...`)

  const { error } = await supabase.from('properties').upsert(cleaned, {
    onConflict: 'property_name',
  })

  if (error) {
    throw new Error(`Seed failed: ${error.message}`)
  }

  console.log('Seed complete.')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
