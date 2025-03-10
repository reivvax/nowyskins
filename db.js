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
//trades states: 0: 'To be accepted by seller', 'Trade offer to be sent', 'To be accepted by buyer', 'Completed', 'Cancelled'
//TODO change user tradelink to trade token
const setup = `
CREATE TABLE IF NOT EXISTS users (
  steam_id          VARCHAR(20)     PRIMARY KEY,
  display_name      VARCHAR(255),
  balance           DECIMAL(15, 2)  DEFAULT 0,
  email             VARCHAR(255)    UNIQUE,
  phone             VARCHAR(20),
  registered_at     TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
  avatar            VARCHAR(255),
  tradelink         VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS listed_items (
  id                SERIAL PRIMARY KEY,
  asset_id          VARCHAR(20) NOT NULL,
  d                 VARCHAR(30),
  name              VARCHAR(100)    NOT NULL,
  paint_wear        VARCHAR(20),
  paint_seed        VARCHAR(20),
  quality           smallint,
  exterior          smallint,
  rarity            smallint        DEFAULT 0,
  market_hash_name  VARCHAR(100),
  price             DECIMAL(12, 2)  DEFAULT 0,
  icon_url          VARCHAR(255)    NOT NULL,
  inspect_url       VARCHAR(255),
  trade_lock        boolean         DEFAULT false,
  time_added        TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
  active            boolean         DEFAULT true,
  watch_count       INT             DEFAULT 0,
  steam_id          VARCHAR(20),
  FOREIGN KEY       (steam_id)      REFERENCES users(steam_id)
); 

CREATE TABLE IF NOT EXISTS watchlists (
    steam_id VARCHAR(20) REFERENCES users(steam_id) ON DELETE CASCADE,
    listing_id INT REFERENCES listed_items(id) ON DELETE CASCADE,
    PRIMARY KEY (steam_id, listing_id)
);

CREATE TABLE IF NOT EXISTS prices (
  market_hash_name  VARCHAR(100)    PRIMARY KEY,
  price             DECIMAL(12, 2)  NOT NULL
);

CREATE TABLE IF NOT EXISTS trades (
  trade_id          SERIAL PRIMARY KEY, 
  seller_id         VARCHAR(20)     NOT NULL,
  buyer_id          VARCHAR(20)     NOT NULL,
  asset_id          VARCHAR(20)     NOT NULL,
  state             smallint        DEFAULT 0,
  created_at        TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY       (seller_id)     REFERENCES users(steam_id),
  FOREIGN KEY       (buyer_id)      REFERENCES users(steam_id)
);
`;

//Database setup
pool.query(
    setup
);

module.exports = pool;