const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "puneintern-postgres",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "puneintern",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "puneintern"
});

pool.on("connect", () => {
    console.log("PuneIntern PostgreSQL connected!");
});

pool.on("error", (err) => {
    console.error("PostgreSQL error:", err.message);
});

module.exports = pool;
