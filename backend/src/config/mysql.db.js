const mysql = require('mysql2/promise');
const { URL } = require('url');
const { CONFIG } = require("./index");

let pool;

const getMySqlPromiseConnection = async () => {
    if (!pool) {
        const databaseUrl = CONFIG.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set.');
        }

        const parsedUrl = new URL(databaseUrl);

        pool = mysql.createPool({
            host: parsedUrl.hostname,
            user: parsedUrl.username,
            password: parsedUrl.password,
            database: parsedUrl.pathname.substring(1), // Remove leading '/'
            port: parsedUrl.port || 3306, // Default MySQL port
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool.getConnection();
};

module.exports = { getMySqlPromiseConnection };