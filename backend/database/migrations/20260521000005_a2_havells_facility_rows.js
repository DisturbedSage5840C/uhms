const A2_BUILDING_NAME = 'A2-Havells Building';

const A2_GROUND_OFFICE_LABELS    = ['2001'];
const A2_FIRST_ROOM_LABELS       = ['2103'];
const A2_FIRST_SPECIAL_LABELS    = ['2102', '2101'];
const A2_FIRST_DEEPCLEAN_LABELS  = ['2104'];
const A2_SECOND_ROOM_LABELS      = ['2201', '2202', '2203'];
const A2_SECOND_DEEPCLEAN_LABELS = ['2204'];
const A2_THIRD_LAB_LABELS        = ['2301', '2302', '2303', '2304', '2305'];
const A2_THIRD_SPECIAL_LABELS    = ['2306'];
const A2_FOURTH_SPECIAL_LABELS   = ['2401'];
const A2_FOURTH_ROOM_LABELS      = [
    '2402','2403','2404','2405','2406','2407','2408','2409','2410',
    '2411','2412','2413','2414','2415','2416','2417','2418','2419',
    '2420','2421','2422','2423',
];

const A2_FACILITY_CONFIG = {
    G: [
        { type: 'Lobby',               count: 1 },
        { type: 'Makerspace',          count: 1 },
        { type: 'Office',              count: 1 },
        { type: 'Washroom (Male)',      count: 1 },
        { type: 'Washroom (Female)',    count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Lift Lobby',          count: 1 },
    ],
    1: [
        { type: 'Washroom (Male)',      count: 1 },
        { type: 'Washroom (Female)',    count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Room',                count: 1 },
        { type: 'Special Room',        count: 2 },
        { type: 'Deep Clean Room',     count: 1 },
        { type: 'Lift Lobby',          count: 1 },
    ],
    2: [
        { type: 'Lift Lobby',          count: 1 },
        { type: 'Washroom (Male)',      count: 1 },
        { type: 'Washroom (Female)',    count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Jefferies',           count: 1 },
        { type: 'Room',                count: 3 },
        { type: 'Deep Clean Room',     count: 1 },
    ],
    3: [
        { type: 'Lab',                 count: 5 },
        { type: 'Special Room',        count: 1 },
        { type: 'Washroom (Male)',      count: 1 },
        { type: 'Washroom (Female)',    count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
        { type: 'Corridor',            count: 1 },
        { type: 'Lift Lobby',          count: 1 },
    ],
    4: [
        { type: 'Special Room',        count: 1 },
        { type: 'Room',                count: 22 },
        { type: 'Corridor',            count: 1 },
        { type: 'Washroom (Male)',      count: 1 },
        { type: 'Washroom (Female)',    count: 1 },
        { type: 'Washroom (Inclusive)', count: 1 },
    ],
};

function buildA2FacilityRows() {
    return Object.entries(A2_FACILITY_CONFIG).flatMap(([floor, facilities]) =>
        facilities.flatMap(({ type, count }) =>
            Array.from({ length: count }, (_, index) => {
                const f = String(floor);
                let facilityNumber;

                if      (f === 'G' && type === 'Office')           facilityNumber = A2_GROUND_OFFICE_LABELS[index];
                else if (f === '1' && type === 'Room')             facilityNumber = A2_FIRST_ROOM_LABELS[index];
                else if (f === '1' && type === 'Special Room')     facilityNumber = A2_FIRST_SPECIAL_LABELS[index];
                else if (f === '1' && type === 'Deep Clean Room')  facilityNumber = A2_FIRST_DEEPCLEAN_LABELS[index];
                else if (f === '2' && type === 'Room')             facilityNumber = A2_SECOND_ROOM_LABELS[index];
                else if (f === '2' && type === 'Deep Clean Room')  facilityNumber = A2_SECOND_DEEPCLEAN_LABELS[index];
                else if (f === '3' && type === 'Lab')              facilityNumber = A2_THIRD_LAB_LABELS[index];
                else if (f === '3' && type === 'Special Room')     facilityNumber = A2_THIRD_SPECIAL_LABELS[index];
                else if (f === '4' && type === 'Special Room')     facilityNumber = A2_FOURTH_SPECIAL_LABELS[index];
                else if (f === '4' && type === 'Room')             facilityNumber = A2_FOURTH_ROOM_LABELS[index];
                else                                               facilityNumber = String(index + 1);

                return {
                    building: A2_BUILDING_NAME,
                    floor: f,
                    facility_type: type,
                    facility_number: facilityNumber,
                };
            })
        )
    );
}

exports.up = async function up(knex) {
    const existing = await knex('facility_updates')
        .where('building', A2_BUILDING_NAME)
        .count('id as count')
        .first();

    if (!existing || Number(existing.count) === 0) {
        await knex('facility_updates').insert(buildA2FacilityRows());
    }
};

exports.down = async function down(knex) {
    await knex('facility_updates').where('building', A2_BUILDING_NAME).delete();
};
