// The A1 washroom checklist data was accidentally stored in washroom_checklists
// (linked to H2 washrooms) due to findWashroomForFacilityRow not checking the building.
// This migration copies the checklist_items back to the correct facility_updates rows
// and removes the misrouted washroom_checklists entries.
exports.up = async function up(knex) {
    // Find A1 facility_updates rows that have no checklist_items
    const a1Rows = await knex('facility_updates')
        .where('building', 'A1-Bharti Academic Building')
        .whereNull('checklist_items')
        .whereNotNull('last_updated');

    for (const row of a1Rows) {
        // Find a washroom_checklists entry whose submitted_at is within 5 seconds of last_updated
        const match = await knex('washroom_checklists')
            .whereRaw("ABS(EXTRACT(EPOCH FROM (submitted_at - ?::timestamptz))) < 5", [row.last_updated])
            .first();

        if (match && match.checklist_items) {
            const items = typeof match.checklist_items === 'string'
                ? JSON.parse(match.checklist_items)
                : match.checklist_items;

            await knex('facility_updates')
                .where('id', row.id)
                .update({ checklist_items: JSON.stringify(items) });

            // Remove the misrouted entry from washroom_checklists
            await knex('washroom_checklists').where('id', match.id).delete();
        }
    }
};

exports.down = async function down(_knex) {
    // Not reversible — data recovery migration
};
