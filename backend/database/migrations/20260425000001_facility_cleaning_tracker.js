const BUILDING_NAME = 'H2 Hostel';

const STANDARD_FLOOR_FACILITIES = [
    { type: 'Room', count: 32 },
    { type: 'Washroom', count: 2 },
    { type: 'Refrigerator', count: 1 },
    { type: 'Induction', count: 1 },
    { type: 'Water Cooler', count: 2 },
    { type: 'Microwave', count: 1 },
    { type: 'Sink', count: 1 },
    { type: 'Corridor', count: 1 },
    { type: 'Drying Stand', count: 2 },
];

const STANDARD_FLOOR_WITH_WASHING_FACILITIES = [
    { type: 'Room', count: 32 },
    { type: 'Washroom', count: 2 },
    { type: 'Refrigerator', count: 1 },
    { type: 'Induction', count: 1 },
    { type: 'Water Cooler', count: 2 },
    { type: 'Microwave', count: 1 },
    { type: 'Sink', count: 1 },
    { type: 'Corridor', count: 1 },
    { type: 'Washing Machine', count: 2 },
    { type: 'Drying Stand', count: 2 },
];

const FACILITY_CONFIG = {
    G: [
        { type: 'Meeting Room', count: 4 },
        { type: 'Lounge', count: 1 },
        { type: 'MPH', count: 1 },
        { type: 'Art Room', count: 1 },
        { type: 'Washroom (Male)', count: 2 },
        { type: 'Washroom (Female)', count: 2 },
        { type: 'Washroom (Inclusive)', count: 1 },
    ],
    1: [
        { type: 'Room', count: 17 },
        { type: 'Meeting Room', count: 8 },
        { type: 'Washroom', count: 1 },
        { type: 'Refrigerator', count: 1 },
        { type: 'Induction', count: 1 },
        { type: 'Water Cooler', count: 2 },
        { type: 'Microwave', count: 1 },
        { type: 'Sink', count: 1 },
        { type: 'Corridor', count: 1 },
        { type: 'Balcony', count: 1 },
    ],
    2: STANDARD_FLOOR_FACILITIES,
    3: STANDARD_FLOOR_WITH_WASHING_FACILITIES,
    4: STANDARD_FLOOR_FACILITIES,
    5: STANDARD_FLOOR_WITH_WASHING_FACILITIES,
    6: STANDARD_FLOOR_FACILITIES,
    7: [
        { type: 'Room', count: 27 },
        { type: 'Washroom', count: 2 },
        { type: 'Refrigerator', count: 1 },
        { type: 'Induction', count: 1 },
        { type: 'Water Cooler', count: 2 },
        { type: 'Microwave', count: 1 },
        { type: 'Sink', count: 1 },
        { type: 'Corridor', count: 1 },
        { type: 'Washing Machine', count: 2 },
        { type: 'Drying Stand', count: 2 },
    ],
    8: STANDARD_FLOOR_FACILITIES,
    9: STANDARD_FLOOR_FACILITIES,
};

function buildFacilityRows() {
    return Object.entries(FACILITY_CONFIG).flatMap(([floor, facilities]) =>
        facilities.flatMap(({ type, count }) =>
            Array.from({ length: count }, (_, index) => ({
                building: BUILDING_NAME,
                floor,
                facility_type: type,
                facility_number: type === 'Room'
                    ? `${floor}${String(index + 1).padStart(2, '0')}`
                    : index + 1,
            }))
        )
    );
}

exports.up = async function up(knex) {
    await knex.schema.createTable('facility_updates', (table) => {
        table.increments('id').primary();
        table.string('building', 100).notNullable();
        table.string('floor', 10).notNullable();
        table.string('facility_type', 100).notNullable();
        table.integer('facility_number').notNullable();
        table.string('cleaned', 5);
        table.string('photo_url', 500);
        table.timestamp('last_updated');
        table.string('updated_by', 255);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

        table.index('building');
        table.index('floor');
        table.index('facility_type');
        table.index('last_updated');
    });

    await knex('facility_updates').insert(buildFacilityRows());
};

exports.down = function down(knex) {
    return knex.schema.dropTableIfExists('facility_updates');
};
