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

const A4_BUILDING_NAME = 'A4-HDFC Innovation Hub';
const A4_GROUND_OFFICE_LABELS = ['4001', '4002', '4003', '4004', '4005', '4006', '4007', '4008', '4009'];

const A4_FACILITY_CONFIG_SEED = {
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

function buildA4FacilityRows() {
    return Object.entries(A4_FACILITY_CONFIG_SEED).flatMap(([floor, facilities]) =>
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
    await knex('facility_updates').insert(buildA4FacilityRows());

    // A2-Havells Building — fresh install seed
    const a2Name = 'A2-Havells Building';
    const a2GO  = ['2001'];
    const a2FR  = ['2103'];
    const a2FS  = ['2102','2101'];
    const a2FD  = ['2104'];
    const a2SR  = ['2201','2202','2203'];
    const a2SD  = ['2204'];
    const a2TL  = ['2301','2302','2303','2304','2305'];
    const a2TS  = ['2306'];
    const a2FoS = ['2401'];
    const a2FoR = ['2402','2403','2404','2405','2406','2407','2408','2409','2410',
                   '2411','2412','2413','2414','2415','2416','2417','2418','2419',
                   '2420','2421','2422','2423'];
    const a2Config = {
        G: [
            {type:'Lobby',count:1},{type:'Makerspace',count:1},{type:'Office',count:1},
            {type:'Washroom (Male)',count:1},{type:'Washroom (Female)',count:1},{type:'Washroom (Inclusive)',count:1},
            {type:'Lift Lobby',count:1},
        ],
        1: [
            {type:'Washroom (Male)',count:1},{type:'Washroom (Female)',count:1},{type:'Washroom (Inclusive)',count:1},
            {type:'Room',count:1},{type:'Special Room',count:2},{type:'Deep Clean Room',count:1},{type:'Lift Lobby',count:1},
        ],
        2: [
            {type:'Lift Lobby',count:1},
            {type:'Washroom (Male)',count:1},{type:'Washroom (Female)',count:1},{type:'Washroom (Inclusive)',count:1},
            {type:'Jefferies',count:1},{type:'Room',count:3},{type:'Deep Clean Room',count:1},
        ],
        3: [
            {type:'Lab',count:5},{type:'Special Room',count:1},
            {type:'Washroom (Male)',count:1},{type:'Washroom (Female)',count:1},{type:'Washroom (Inclusive)',count:1},
            {type:'Corridor',count:1},{type:'Lift Lobby',count:1},
        ],
        4: [
            {type:'Special Room',count:1},{type:'Room',count:22},{type:'Corridor',count:1},
            {type:'Washroom (Male)',count:1},{type:'Washroom (Female)',count:1},{type:'Washroom (Inclusive)',count:1},
        ],
    };
    const a2Rows = Object.entries(a2Config).flatMap(([floor, facilities]) =>
        facilities.flatMap(({type, count}) =>
            Array.from({length: count}, (_, idx) => {
                const f = String(floor);
                let fn;
                if      (f==='G'&&type==='Office')          fn=a2GO[idx];
                else if (f==='1'&&type==='Room')            fn=a2FR[idx];
                else if (f==='1'&&type==='Special Room')    fn=a2FS[idx];
                else if (f==='1'&&type==='Deep Clean Room') fn=a2FD[idx];
                else if (f==='2'&&type==='Room')            fn=a2SR[idx];
                else if (f==='2'&&type==='Deep Clean Room') fn=a2SD[idx];
                else if (f==='3'&&type==='Lab')             fn=a2TL[idx];
                else if (f==='3'&&type==='Special Room')    fn=a2TS[idx];
                else if (f==='4'&&type==='Special Room')    fn=a2FoS[idx];
                else if (f==='4'&&type==='Room')            fn=a2FoR[idx];
                else                                        fn=String(idx+1);
                return {building:a2Name, floor:f, facility_type:type, facility_number:fn};
            })
        )
    );
    await knex('facility_updates').insert(a2Rows);
};

exports.down = function down(knex) {
    return knex.schema.dropTableIfExists('facility_updates');
};
