exports.up = function up(knex) {
    return knex.schema.table('facility_updates', (table) => {
        table.text('comment');
    });
};

exports.down = function down(knex) {
    return knex.schema.table('facility_updates', (table) => {
        table.dropColumn('comment');
    });
};
