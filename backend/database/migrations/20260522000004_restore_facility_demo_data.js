/**
 * Re-seeds facility_updates demo data for the washroom checklists dashboard.
 * Runs after 20260522000003 which cleared seeded data; this restores a
 * representative set so the admin view is not empty on first deployment.
 *
 * Guard: skips if there are already 5+ rows with last_updated set, so real
 * supervisor activity on an existing deployment is never overwritten.
 */

exports.up = async function up(knex) {
    const { count } = await knex('facility_updates')
        .whereNotNull('last_updated')
        .count('id as count')
        .first();

    if (Number(count) >= 5) return; // already has meaningful data

    const now = new Date();
    const hoursAgo = (h) => new Date(now - h * 3600000);

    const FULL = JSON.stringify({
        floor_mopping: true, sink_cleaning: true, dustbin_cleared: true,
        soap_refill: true, tissue_refill: true, sanitizer_refill: true,
    });
    const PARTIAL = JSON.stringify({
        floor_mopping: true, sink_cleaning: true, dustbin_cleared: true,
        soap_refill: true, tissue_refill: false, sanitizer_refill: true,
    });

    const meera  = await knex('users').where('email', 'meera@hostel.com').first('id', 'name');
    const suresh = await knex('users').where('email', 'suresh@hostel.com').first('id', 'name');
    if (!meera || !suresh) return;

    const slots = [
        // H2 Hostel washrooms
        { building: 'H2 Hostel', floor: 'G', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: meera,  hoursBack: 3,  items: FULL    },
        { building: 'H2 Hostel', floor: '1', types: ['Washroom'],                                                     by: suresh, hoursBack: 14, items: PARTIAL  },
        { building: 'H2 Hostel', floor: '2', types: ['Washroom'],                                                     by: meera,  hoursBack: 26, items: FULL    },
        { building: 'H2 Hostel', floor: '3', types: ['Washroom'],                                                     by: suresh, hoursBack: 7,  items: FULL    },
        { building: 'H2 Hostel', floor: '4', types: ['Washroom'],                                                     by: meera,  hoursBack: 38, items: PARTIAL  },
        { building: 'H2 Hostel', floor: '5', types: ['Washroom'],                                                     by: suresh, hoursBack: 50, items: FULL    },
        { building: 'H2 Hostel', floor: '6', types: ['Washroom'],                                                     by: meera,  hoursBack: 9,  items: FULL    },
        { building: 'H2 Hostel', floor: '7', types: ['Washroom'],                                                     by: suresh, hoursBack: 22, items: PARTIAL  },
        { building: 'H2 Hostel', floor: '8', types: ['Washroom'],                                                     by: meera,  hoursBack: 34, items: FULL    },
        { building: 'H2 Hostel', floor: '9', types: ['Washroom'],                                                     by: suresh, hoursBack: 11, items: FULL    },
        // A1-Bharti Academic Building
        { building: 'A1-Bharti Academic Building', floor: 'G', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: meera,  hoursBack: 18, items: FULL    },
        { building: 'A1-Bharti Academic Building', floor: '1', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: suresh, hoursBack: 42, items: PARTIAL  },
        { building: 'A1-Bharti Academic Building', floor: '2', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: meera,  hoursBack: 18, items: FULL    },
        { building: 'A1-Bharti Academic Building', floor: '3', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: suresh, hoursBack: 42, items: FULL    },
        { building: 'A1-Bharti Academic Building', floor: '4', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: meera,  hoursBack: 18, items: PARTIAL  },
        // A4-HDFC Innovation Hub
        { building: 'A4-HDFC Innovation Hub', floor: 'G', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: meera,  hoursBack: 5,  items: FULL    },
        { building: 'A4-HDFC Innovation Hub', floor: '1', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: suresh, hoursBack: 29, items: PARTIAL  },
        // A2-Havells Building
        { building: 'A2-Havells Building', floor: 'G', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: suresh, hoursBack: 16, items: FULL    },
        { building: 'A2-Havells Building', floor: '1', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: meera,  hoursBack: 40, items: FULL    },
        { building: 'A2-Havells Building', floor: '2', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: suresh, hoursBack: 16, items: PARTIAL  },
        { building: 'A2-Havells Building', floor: '3', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: meera,  hoursBack: 40, items: FULL    },
        { building: 'A2-Havells Building', floor: '4', types: ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'], by: suresh, hoursBack: 16, items: PARTIAL  },
    ];

    for (const slot of slots) {
        const ts = hoursAgo(slot.hoursBack);
        await knex('facility_updates')
            .where('building', slot.building)
            .where('floor', slot.floor)
            .whereIn('facility_type', slot.types)
            .whereNull('last_updated')
            .update({
                cleaned:         'yes',
                last_updated:    ts,
                updated_by:      slot.by.name,
                checklist_items: slot.items,
                photo_url:       null,
                comment:         null,
                updated_at:      ts,
            });
    }
};

exports.down = async function down(knex) {
    await knex('facility_updates')
        .whereIn('updated_by', ['Meera Desai', 'Suresh Nair'])
        .update({ cleaned: null, last_updated: null, updated_by: null, checklist_items: null, updated_at: knex.fn.now() });
};
