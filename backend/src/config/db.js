const config = require('./env');
const knexLib = require('knex');

let knex = null;

function hasMysqlConfig() {
  return Boolean(config.MYSQL_HOST && config.MYSQL_USER && config.MYSQL_DATABASE);
}

async function connectDB() {
  if (!hasMysqlConfig()) {
    console.log('MySQL config not provided. Running in offline/mock mode.');
    return null;
  }

  knex = knexLib({
    client: 'mysql2',
    connection: {
      host: config.MYSQL_HOST,
      port: config.MYSQL_PORT,
      user: config.MYSQL_USER,
      password: config.MYSQL_PASSWORD,
      database: config.MYSQL_DATABASE,
    },
    pool: { min: 0, max: 10 },
    acquireConnectionTimeout: 10000,
  });

  // Simple connection test
  try {
    await knex.raw('SELECT 1');
    console.log('✅ Connected to MySQL');
  } catch (e) {
    console.log('⚠️  Failed to connect to MySQL. Falling back to offline/mock mode. Error:', e.message);
    knex = null;
  }

  return knex;
}

function getDb() {
  return knex;
}

module.exports = connectDB;
module.exports.getDb = getDb;
