/**
 * Knex Configuration - Database migrations and connection
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const config = require('./index');

const connection = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
        ssl: config.db.ssl,
    };

module.exports = {
    development: {
        client: 'pg',
        connection,
        pool: config.db.pool,
        migrations: {
            directory: '../database/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: '../database/seeds',
        },
    },

    production: {
        client: 'pg',
        connection,
        pool: config.db.pool,
        migrations: {
            directory: '../database/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: '../database/seeds',
        },
    },
};
