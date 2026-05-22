const db     = require('../database/postgres');
const logger = require('../utils/logger');

const SHIFT_HOURS       = 8;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // check every hour

let checkHandle = null;

async function resetFacilityStatuses() {
    try {
        const count = await db('facility_updates')
            .whereNotNull('last_updated')
            .update({
                cleaned:         null,
                last_updated:    null,
                updated_by:      null,
                checklist_items: null,
                photo_url:       null,
                comment:         null,
                updated_at:      db.fn.now(),
            });
        logger.info('Facility statuses reset for new shift', { rows: count });
    } catch (error) {
        logger.error('Facility status reset failed', { error: error.message });
    }
}

// Check if oldest updated row is 8+ hours old — if so, reset.
// Called on startup AND every hour so Render spin-downs don't skip resets.
async function checkAndResetIfOverdue() {
    try {
        const row = await db('facility_updates')
            .whereNotNull('last_updated')
            .min('last_updated as oldest')
            .first();

        if (!row || !row.oldest) return;

        const hoursSince = (Date.now() - new Date(row.oldest).getTime()) / 3_600_000;
        if (hoursSince >= SHIFT_HOURS) {
            logger.info(`Facility reset triggered — oldest record is ${hoursSince.toFixed(1)}h old`);
            await resetFacilityStatuses();
        }
    } catch (error) {
        logger.error('Facility reset check failed', { error: error.message });
    }
}

function startFacilityResetScheduler() {
    // Run immediately on startup to catch resets missed during server downtime
    checkAndResetIfOverdue();
    checkHandle = setInterval(checkAndResetIfOverdue, CHECK_INTERVAL_MS);
    if (typeof checkHandle.unref === 'function') checkHandle.unref();
    logger.info('Facility reset scheduler started (checks hourly, resets after 8 h)');
}

function stopFacilityResetScheduler() {
    if (checkHandle) { clearInterval(checkHandle); checkHandle = null; }
}

module.exports = { startFacilityResetScheduler, stopFacilityResetScheduler };
