/**
 * Production startup script
 * 1. Runs DB migrations (always — idempotent)
 * 2. Seeds initial data ONLY if the database is empty (first deploy)
 * 3. Hands off to the main server
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const knexfilePath = path.join(__dirname, '..', 'config', 'knexfile.js');
const env = process.env.NODE_ENV || 'development';

async function run() {
    const db = require('../database/postgres');

    try {
        console.log('▶ Running database migrations...');
        execSync(`npx knex migrate:latest --knexfile "${knexfilePath}" --env ${env}`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
        });
        console.log('✓ Migrations complete');

        // Only seed on a brand-new (empty) database
        const userCount = await db('users').count('id as n').first();
        const isEmpty = parseInt(userCount.n, 10) === 0;

        if (isEmpty) {
            console.log('▶ Fresh database detected — seeding initial data...');
            execSync(`npx knex seed:run --knexfile "${knexfilePath}" --env ${env}`, {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..'),
            });
            console.log('✓ Seeding complete');
        } else {
            console.log(`✓ Database has ${userCount.n} users — skipping seed`);
        }

        await db.destroy();
        console.log('✓ Ready to start server\n');
    } catch (err) {
        console.error('✗ Startup failed:', err.message);
        process.exit(1);
    }
}

run();
