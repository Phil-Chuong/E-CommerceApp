// DB/db.js
const { Pool } = require('pg');
const config = require('../config');

//const pool = new Pool(config.DB_CONFIG);
const pool = new Pool(config.DB);
console.log('Connected to Database');
module.exports = pool;
