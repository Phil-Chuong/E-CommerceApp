// config/index.js

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  SESSION_SECRET: process.env.SESSION_SECRET,
  DB_CONFIG: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }
};