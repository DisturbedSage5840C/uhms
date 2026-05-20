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

const A1_BUILDING_NAME = 'A1-Bharti Academic Building';
const A1_GROUND_ROOM_LABELS = ['A1001A', 'A1001B', 'A1002', 'A1003', 'A1004', 'A1005'];

const A1_FACILITY_CONFIG = {
    G: [
        { type: 'Reception', count: 1 },
        { type: 'Corridor', count: 1 },
        { type: 'Lift Lobby', count: 1 },
        { type: 'Room', count: 6 },
        { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
    ],
    1: [
        { type: 'Corridor', count: 1 },
        { type: 'Lift Lobby', count: 1 },
        { type: 'Room', count: 10 },
        { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
    ],
    2: [
        { type: 'Corridor', count: 1 },
        { type: 'Lift Lobby', count: 1 },
        { type: 'Room', count: 10 },
        { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
    ],
    3: [
        { type: 'Corridor', count: 1 },
        { type: 'Lift Lobby', count: 1 },
        { type: 'Room', count: 10 },
        { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
    ],
    4: [
        { type: 'Corridor', count: 1 },
        { type: 'Lift Lobby', count: 1 },
        { type: 'Room', count: 10 },
        { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
    ],
};

function buildFacilityRows() {
    return Object.entries(FACILITY_CONFIG).flatMap(([floor, facilities]) =>
        facilities.flatMap(({ type, count }) =>
            Array.from({ length: count }, (_, index) => ({
                building: BUILDING_NAME,
                floor: String(floor),
                facility_type: type,
                facility_number: type === 'Room'
                    ? `${floor}${String(index + 1).padStart(2, '0')}`
                    : String(index + 1),
            }))
        )
    );
}

function buildA1FacilityRows() {
    return Object.entries(A1_FACILITY_CONFIG).flatMap(([floor, facilities]) => {
        let roomIndexForGround = 0;
        return facilities.flatMap(({ type, count }) =>
            Array.from({ length: count }, (_, index) => {
                let facilityNumber;
                if (type === 'Room') {
                    if (String(floor) === 'G') {
                        facilityNumber = A1_GROUND_ROOM_LABELS[roomIndexForGround++];
                    } else {
                        facilityNumber = String(index + 1);
                    }
                } else {
                    facilityNumber = String(index + 1);
                }
                return {
                    building: A1_BUILDING_NAME,
                    floor: String(floor),
                    facility_type: type,
                    facility_number: facilityNumber,
                };
            })
        );
    });
}

exports.up = async function up(knex) {
    await knex.schema.createTable('facility_updates', (table) => {
        table.increments('id').primary();
        table.string('building', 100).notNullable();
        table.string('floor', 10).notNullable();
        table.string('facility_type', 100).notNullable();
        table.string('facility_number', 50).notNullable();
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
    await knex('facility_updates').insert(buildA1FacilityRows());
};

exports.down = function down(knex) {
    return knex.schema.dropTableIfExists('facility_updates');
};
