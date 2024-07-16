const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "cstest",
    password: process.env['DATABASE_PASSWORD'],
    port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

const setup = `CREATE TABLE IF NOT EXISTS users (
  steam_id VARCHAR(255) PRIMARY KEY,
  display_name VARCHAR(255),
  balance DECIMAL(12, 2) DEFAULT 0,
  email VARCHAR(255),
  registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  avatar VARCHAR(255),
  tradelink VARCHAR(255)
  );`;

//Database setup
pool.query(
    setup
);

module.exports = pool;