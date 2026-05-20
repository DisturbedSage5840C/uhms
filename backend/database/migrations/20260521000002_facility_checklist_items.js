exports.up = async function up(knex) {
    const hasColumn = await knex.schema.hasColumn('facility_updates', 'checklist_items');
    if (!hasColumn) {
        await knex.schema.alterTable('facility_updates', (table) => {
            table.jsonb('checklist_items').nullable();
        });
    }
};

exports.down = async function down(knex) {
    await knex.schema.alterTable('facility_updates', (table) => {
        table.dropColumn('checklist_items');
    });
};
