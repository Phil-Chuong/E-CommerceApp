// testConnection.js

const { Pool } = require('pg');

// Set up your database connection configuration
const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    // ssl: {
    //     rejectUnauthorized: false // Optional, remove if not using SSL
    // }
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');

        // Run a simple query to test the connection
        const res = await client.query('SELECT NOW()');
        console.log('Current Time:', res.rows[0].now);

        // Release the client
        client.release();
    } catch (err) {
        console.error('Database connection error:', err.stack);
    }
}

testConnection();
