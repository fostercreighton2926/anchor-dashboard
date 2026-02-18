import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  const dataPath = path.join(__dirname, '..', 'data', 'properties.json')
  const properties = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  console.log(`Seeding ${properties.length} properties...`)

  for (const property of properties) {
    const { error } = await supabase
      .from('properties')
      .upsert(property, { onConflict: 'property_name' })

    if (error) {
      console.error(`Error seeding ${property.property_name}:`, error.message)
    } else {
      console.log(`  ✓ ${property.property_name}`)
    }
  }

  console.log('\nDone!')
}

seed().catch(console.error)
