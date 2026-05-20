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
    // Alter facility_number column from integer to varchar to support string room labels
    await knex.schema.alterTable('facility_updates', (table) => {
        table.string('facility_number', 50).alter();
    });

    // Only insert if rows don't already exist for this building
    const existing = await knex('facility_updates')
        .where('building', A1_BUILDING_NAME)
        .count('id as count')
        .first();

    if (!existing || Number(existing.count) === 0) {
        await knex('facility_updates').insert(buildA1FacilityRows());
    }
};

exports.down = async function down(knex) {
    await knex('facility_updates').where('building', A1_BUILDING_NAME).delete();
};
