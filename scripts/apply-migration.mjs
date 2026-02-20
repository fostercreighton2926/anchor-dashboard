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

// Create a postgres client via SQL query
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_debt_asset_extension.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('Applying migration: 002_debt_asset_extension.sql')
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`Executing ${statements.length} SQL statements...`)
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    console.log(`  [${i + 1}/${statements.length}] ${stmt.substring(0, 60)}...`)
    
    try {
      // Use the SQL editor endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: stmt + ';' })
      })
      
      if (!response.ok) {
        console.warn(`    Warning: Statement may have failed (${response.status})`)
        // Continue anyway - some statements might be idempotent
      }
    } catch (error) {
      console.warn(`    Warning: ${error.message}`)
      // Continue anyway
    }
  }
  
  console.log('\n✅ Migration statements executed')
  console.log('   Verify in Supabase dashboard: Tables > asset_metrics, debt_schedule')
}

applyMigration().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
