module.exports = {
    PORT: process.env.PORT,
    DB: {       
        PGHOST: process.env.PGHOST,
        PGUSER: process.env.PGUSER,
        PGDATABASE: process.env.PGDATABASE,
        PGPASSWORD: process.env.PGPASSWORD,
        PGPORT: process.env.PGPORT,     
    },
    DB_CONFIG: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    },
    SESSION_SECRET: process.env.SESSION_SECRET
};
