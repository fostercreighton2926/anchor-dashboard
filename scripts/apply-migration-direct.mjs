import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Extract connection info from Supabase URL
// Format: https://abc123.supabase.co
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!projectRef) {
  console.error('Invalid Supabase URL format')
  process.exit(1)
}

const connectionString = `postgresql://postgres.${projectRef}:${supabaseServiceKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

async function applyMigration() {
  const client = new pg.Client({ connectionString })
  
  try {
    console.log('Connecting to Supabase...')
    await client.connect()
    console.log('✅ Connected')
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_debt_asset_extension.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')
    
    console.log('\nApplying migration: 002_debt_asset_extension.sql\n')
    
    // Execute the entire migration
    await client.query(sql)
    
    console.log('✅ Migration applied successfully')
    console.log('   Tables created: asset_metrics, debt_schedule')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

applyMigration().catch((error) => {
  console.error(error)
  process.exit(1)
})
