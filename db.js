const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "cstest",
    password: "Biedronka2012$",
    port: 5432,
});

module.exports = pool;