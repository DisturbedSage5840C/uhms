require('dotenv').config();
const db = require('../database/postgres');

async function initializeDatabase() {
    console.log('🏨 Initializing Database (Migrations only)...\n');

    try {
        // Run migrations only
        console.log('Running migrations...');
        const [batch, migrations] = await db.migrate.latest();
        if (migrations.length === 0) {
            console.log('  ✓ Already up to date');
        } else {
            console.log(`  ✓ Ran ${migrations.length} migrations (batch ${batch})`);
            migrations.forEach(m => console.log(`    - ${m}`));
        }

        console.log('\n✅ Database initialization complete!\n');
        console.log('Demo Credentials:');
        console.log('─────────────────────────────────────');
        console.log('Admin:      admin@hostel.com / password123');
        console.log('Supervisor: meera@hostel.com / password123');
        console.log('Staff:      rajesh@hostel.com / password123');
        console.log('Student:    student1@hostel.com / password123');
        console.log('─────────────────────────────────────\n');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

initializeDatabase();
