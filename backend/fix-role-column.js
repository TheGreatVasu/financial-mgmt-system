#!/usr/bin/env node
/**
 * Script to fix the role column in the users table
 * Run this with: node fix-role-column.js
 */

const knex = require('knex');
const fs = require('fs');
const path = require('path');

// Load database config
const dbConfig = require('./src/config/db').getDbConfig();

async function fixRoleColumn() {
  console.log('🔧 Fixing role column in users table...');
  
  const db = knex(dbConfig);
  
  try {
    // Read and execute the migration
    const migrationPath = path.join(__dirname, 'migrations', '202501200000_fix_role_column_comprehensive.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.raw(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
          // Skip errors for constraints that don't exist
          if (err.message && (err.message.includes('does not exist') || err.message.includes('Duplicate'))) {
            console.log('ℹ️  Skipped (expected):', err.message);
            continue;
          }
          throw err;
        }
      }
    }
    
    // Verify the fix
    const result = await db.raw("SHOW COLUMNS FROM users WHERE Field = 'role'");
    console.log('\n✅ Role column fixed!');
    console.log('Column details:', result[0][0]);
    
    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing role column:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

fixRoleColumn();

