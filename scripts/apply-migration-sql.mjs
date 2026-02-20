import { createClient } from '@supabase/supabase-js'
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_debt_asset_extension.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('Applying migration via Supabase REST API...\n')
  
  // Split into individual CREATE TABLE and CREATE INDEX statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`Executing ${statements.length} statements...\n`)
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    const preview = stmt.substring(0, 80).replace(/\s+/g, ' ')
    
    try {
      // Try using the SQL query endpoint
      const { data, error } = await supabase.rpc('exec_sql', { sql_string: stmt })
      
      if (error) {
        // If exec_sql doesn't exist, the tables probably need to be created manually
        console.log(`  ⚠️  [${i + 1}/${statements.length}] ${preview}...`)
        console.log(`      Error: ${error.message}`)
        console.log('      (This is expected - manual SQL execution needed)')
      } else {
        console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`)
      }
    } catch (err) {
      console.log(`  ⚠️  [${i + 1}/${statements.length}] ${preview}...`)
      console.log(`      ${err.message}`)
    }
  }
  
  console.log('\n📋 Migration SQL ready - needs manual execution in Supabase Dashboard')
  console.log('\nNext steps:')
  console.log('1. Go to https://supabase.com/dashboard/project/_/sql/new')
  console.log('2. Copy/paste the SQL from: supabase/migrations/002_debt_asset_extension.sql')
  console.log('3. Click "Run"')
  console.log('4. Then run: npm run seed')
}

applyMigration().catch((error) => {
  console.error(error)
  process.exit(1)
})
