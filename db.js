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

//item exterior: 0 = BS, ..., 4 = FN
const setup = `CREATE TABLE IF NOT EXISTS users (
  steam_id VARCHAR(255) PRIMARY KEY,
  display_name VARCHAR(255),
  balance DECIMAL(12, 2) DEFAULT 0,
  email VARCHAR(255),
  registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  avatar VARCHAR(255),
  tradelink VARCHAR(255)
  );
  drop table listed_items;
  CREATE TABLE IF NOT EXISTS listed_items (
  asset_id VARCHAR(20) PRIMARY KEY,
  class_id VARCHAR(20) NOT NULL,
  instance_id VARCHAR(20) NOT NULL,
  quality INT,
  exterior INT,
  price DECIMAL(12, 2) DEFAULT 0,
  icon_url VARCHAR(255),
  inspect_url VARCHAR(255),
  trade_lock INT,
  steam_id VARCHAR(255),
  FOREIGN KEY (steam_id) REFERENCES users(steam_id)
  );
  `;

//Database setup
pool.query(
    setup
);

module.exports = pool;