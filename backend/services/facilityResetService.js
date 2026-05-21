const db     = require('../database/postgres');
const logger = require('../utils/logger');

const RESET_INTERVAL_MS = 8 * 60 * 60 * 1000; // 8 hours

let resetHandle = null;

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

function startFacilityResetScheduler() {
    resetHandle = setInterval(resetFacilityStatuses, RESET_INTERVAL_MS);
    if (typeof resetHandle.unref === 'function') resetHandle.unref();
    logger.info('Facility reset scheduler started (every 8 hours)');
}

function stopFacilityResetScheduler() {
    if (resetHandle) { clearInterval(resetHandle); resetHandle = null; }
}

module.exports = { startFacilityResetScheduler, stopFacilityResetScheduler };
