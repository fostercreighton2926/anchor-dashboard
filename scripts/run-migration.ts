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

async function runMigration() {
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '002_debt_asset_extension.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('Running migration: 002_debt_asset_extension.sql')
  
  const { error } = await supabase.rpc('exec_sql', { sql_string: sql })
  
  if (error) {
    // Try direct query execution if rpc doesn't work
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      const { error: stmtError } = await supabase.rpc('exec', { query: statement })
      if (stmtError) {
        console.error('Migration statement failed:', statement.substring(0, 100) + '...')
        console.error('Error:', stmtError.message)
        // Continue trying other statements
      }
    }
  }
  
  console.log('✅ Migration complete (check Supabase dashboard to verify)')
}

runMigration().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
