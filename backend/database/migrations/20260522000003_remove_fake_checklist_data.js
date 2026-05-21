/**
 * Removes all artificially seeded washroom checklist submissions.
 * Checklists should only contain real supervisor submissions via the app.
 * Also reverts fake facility_updates changes from the demo seed migrations.
 */

exports.up = async function up(knex) {
    // Clear ALL seeded checklist data — only real submissions belong here
    await knex('washroom_checklists').delete();

    // Revert fake facility_updates entries that were set by demo migrations
    // (only clear rows where updated_by matches seeded supervisor names AND
    //  last_updated is older than the start of today — preserves real user work)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    await knex('facility_updates')
        .whereIn('updated_by', ['Meera Desai', 'Suresh Nair'])
        .where('last_updated', '<', todayStart)
        .update({
            cleaned:         null,
            last_updated:    null,
            updated_by:      null,
            checklist_items: null,
            photo_url:       null,
            comment:         null,
        });
};

exports.down = async function down(knex) {
    // No rollback — we don't restore fake data
};
