const H1_BUILDING_NAME = 'H1 Hostel';
const H1_SIXTH_FLOOR_MR_LABELS = ['MR1', 'MR2', 'MR3', 'MR4'];

const H1_FACILITY_CONFIG = {
    G: [
        { type: 'Lobby',       count: 1 },
        { type: 'Warden Room', count: 2 },
        { type: 'Lift Lobby',  count: 1 },
    ],
    1: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 }, { type: 'Washing Machine', count: 2 },
    ],
    2: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 },
    ],
    3: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 }, { type: 'Washing Machine', count: 2 },
    ],
    4: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 },
    ],
    5: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 }, { type: 'Washing Machine', count: 2 },
    ],
    6: [
        { type: 'Meeting Room', count: 4 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Water Cooler', count: 2 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 },
    ],
    7: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 }, { type: 'Washing Machine', count: 2 },
    ],
    8: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 },
    ],
    9: [
        { type: 'Room', count: 25 }, { type: 'Washroom (Male)', count: 1 },
        { type: 'Washroom (Female)', count: 1 }, { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor', count: 1 }, { type: 'Microwave', count: 1 },
        { type: 'Induction', count: 1 }, { type: 'Refrigerator', count: 1 },
        { type: 'Sink', count: 1 }, { type: 'Water Cooler', count: 2 },
        { type: 'Balcony', count: 1 }, { type: 'Washing Machine', count: 2 },
    ],
};

function buildH1FacilityRows() {
    return Object.entries(H1_FACILITY_CONFIG).flatMap(([floor, facilities]) => {
        let mrIndex = 0;
        return facilities.flatMap(({ type, count }) =>
            Array.from({ length: count }, (_, index) => {
                let facilityNumber;
                const f = String(floor);

                if (f === '6' && type === 'Meeting Room') {
                    facilityNumber = H1_SIXTH_FLOOR_MR_LABELS[mrIndex++];
                } else if (type === 'Room') {
                    facilityNumber = `${f}${String(index + 1).padStart(2, '0')}`;
                } else {
                    facilityNumber = String(index + 1);
                }

                return {
                    building: H1_BUILDING_NAME,
                    floor: f,
                    facility_type: type,
                    facility_number: facilityNumber,
                };
            })
        );
    });
}

exports.up = async function up(knex) {
    const existing = await knex('facility_updates')
        .where('building', H1_BUILDING_NAME)
        .count('id as count')
        .first();

    if (!existing || Number(existing.count) === 0) {
        await knex('facility_updates').insert(buildH1FacilityRows());
    }
};

exports.down = async function down(knex) {
    await knex('facility_updates').where('building', H1_BUILDING_NAME).delete();
};
