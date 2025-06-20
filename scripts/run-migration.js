const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración de subscription_plans...')
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'update-subscription-plans-structure.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Ejecutar la migración
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Error ejecutando migración:', error)
      process.exit(1)
    }
    
    console.log('✅ Migración completada exitosamente')
    
    // Verificar la estructura final
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'subscription_plans')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Error verificando estructura:', columnsError)
    } else {
      console.log('\n📋 Estructura final de subscription_plans:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    process.exit(1)
  }
}

runMigration() 