/**
 * Migration: Remove Google Sheets integration
 * Removes google_access_token, google_refresh_token, google_token_expires_at columns
 */

exports.up = async function(knex) {
  // Check if columns exist before dropping
  const hasTable = await knex.schema.hasTable('users');
  
  if (hasTable) {
    const hasGoogleAccessToken = await knex.schema.hasColumn('users', 'google_access_token');
    const hasGoogleRefreshToken = await knex.schema.hasColumn('users', 'google_refresh_token');
    const hasGoogleTokenExpiresAt = await knex.schema.hasColumn('users', 'google_token_expires_at');
    
    if (hasGoogleAccessToken || hasGoogleRefreshToken || hasGoogleTokenExpiresAt) {
      await knex.schema.alterTable('users', (table) => {
        if (hasGoogleAccessToken) table.dropColumn('google_access_token');
        if (hasGoogleRefreshToken) table.dropColumn('google_refresh_token');
        if (hasGoogleTokenExpiresAt) table.dropColumn('google_token_expires_at');
      });
      console.log('✅ Removed Google token columns from users table');
    }
  }
};

exports.down = async function(knex) {
  // Rollback: Restore the columns (with nullable text fields for tokens)
  const hasTable = await knex.schema.hasTable('users');
  
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.text('google_access_token').nullable();
      table.text('google_refresh_token').nullable();
      table.timestamp('google_token_expires_at').nullable();
    });
    console.log('✅ Restored Google token columns to users table');
  }
};
