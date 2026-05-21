const A4_BUILDING_NAME = 'A4-HDFC Innovation Hub';

const A4_GROUND_OFFICE_LABELS = ['4001', '4002', '4003', '4004', '4005', '4006', '4007', '4008', '4009'];

const A4_FACILITY_CONFIG = {
    G: [
        { type: 'Lift Lobby', count: 1 },
        { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Robotics Lab', count: 1 },
        { type: 'Tool Rack', count: 1 },
        { type: 'Office', count: 9 },
    ],
    1: [
        { type: 'Corridor', count: 1 },
        { type: 'Pantry', count: 1 },
        { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Room', count: 8 },
        { type: 'Special Room', count: 2 },
        { type: 'Phone Booth', count: 1 },
    ],
};

function buildA4FacilityRows() {
    return Object.entries(A4_FACILITY_CONFIG).flatMap(([floor, facilities]) =>
        facilities.flatMap(({ type, count }) =>
            Array.from({ length: count }, (_, index) => {
                let facilityNumber;
                if (type === 'Office') {
                    facilityNumber = A4_GROUND_OFFICE_LABELS[index];
                } else if (type === 'Room') {
                    facilityNumber = String(4102 + index);
                } else if (type === 'Special Room') {
                    facilityNumber = index === 0 ? '4101' : '4110';
                } else {
                    facilityNumber = String(index + 1);
                }
                return {
                    building: A4_BUILDING_NAME,
                    floor: String(floor),
                    facility_type: type,
                    facility_number: facilityNumber,
                };
            })
        )
    );
}

exports.up = async function up(knex) {
    const existing = await knex('facility_updates')
        .where('building', A4_BUILDING_NAME)
        .count('id as count')
        .first();

    if (!existing || Number(existing.count) === 0) {
        await knex('facility_updates').insert(buildA4FacilityRows());
    }
};

exports.down = async function down(knex) {
    await knex('facility_updates').where('building', A4_BUILDING_NAME).delete();
};
