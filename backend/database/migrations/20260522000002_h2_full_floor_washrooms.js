/**
 * Adds washroom records for H2 Hostel floors 3-9 so supervisor checklists
 * can be submitted and viewed for every floor.
 * Also seeds demo checklist submissions for those new washrooms.
 */

exports.up = async function up(knex) {
    const amit   = await knex('users').where('email', 'amit@hostel.com').first('id', 'name');
    const sunita = await knex('users').where('email', 'sunita@hostel.com').first('id', 'name');
    const meera  = await knex('users').where('email', 'meera@hostel.com').first('id', 'name');
    const suresh = await knex('users').where('email', 'suresh@hostel.com').first('id', 'name');
    if (!amit || !sunita || !meera || !suresh) return;

    const now = new Date();
    const daysAgo = (n) => new Date(now - n * 86400000);
    const atHour  = (date, h) => { const d = new Date(date); d.setHours(h, 0, 0, 0); return d; };

    // ── Add washrooms for H2 floors 3–9 ────────────────────────────────────
    const newWashrooms = [];
    for (let floor = 3; floor <= 9; floor++) {
        const staff = floor % 2 === 0 ? amit : sunita;
        newWashrooms.push(
            { building: 'H2', floor, direction: 'Left',  label: `H2 Floor ${floor} Left`,  soap_level: 60, tissue_level: 55, sanitizer_level: 65, freshener_level: 50, status: 'clean',          last_restocked: daysAgo(1), assigned_staff_id: staff.id },
            { building: 'H2', floor, direction: 'Right', label: `H2 Floor ${floor} Right`, soap_level: 40, tissue_level: 35, sanitizer_level: 30, freshener_level: 45, status: 'needs-cleaning', last_restocked: daysAgo(2), assigned_staff_id: staff.id }
        );
    }
    const insertedIds = await knex('washrooms').insert(newWashrooms).returning('id');

    // ── Seed checklist submissions for all H2 washrooms (including new ones) ─
    const allH2Washrooms = await knex('washrooms').where('building', 'H2').select('id', 'floor');

    const FULL    = { soap_refill: true,  tissue_refill: true,  sanitizer_refill: true,  sink_cleaning: true,  floor_mopping: true,  dustbin_cleared: true  };
    const PARTIAL = { soap_refill: true,  tissue_refill: false, sanitizer_refill: true,  sink_cleaning: true,  floor_mopping: true,  dustbin_cleared: true  };
    const LOW     = { soap_refill: false, tissue_refill: true,  sanitizer_refill: false, sink_cleaning: true,  floor_mopping: true,  dustbin_cleared: false };

    // Only seed checklists for newly added washrooms (floors 3-9) to avoid duplicates
    const newWashroomIds = new Set(insertedIds.map(r => r.id));
    const newH2Washrooms = allH2Washrooms.filter(w => newWashroomIds.has(w.id));

    const templates = [
        { daysBack: 0, hour: 8,  sup: meera,  items: FULL,    notes: 'Morning check complete. All supplies stocked.'     },
        { daysBack: 0, hour: 14, sup: suresh, items: PARTIAL, notes: 'Afternoon check. Tissue running low.'              },
        { daysBack: 1, hour: 9,  sup: meera,  items: FULL,    notes: 'Morning rounds complete.'                          },
        { daysBack: 1, hour: 19, sup: suresh, items: LOW,     notes: 'Evening check. Soap and sanitizer need restocking.'},
        { daysBack: 2, hour: 8,  sup: meera,  items: PARTIAL, notes: 'Tissue dispensers empty on this floor.'            },
        { daysBack: 3, hour: 9,  sup: suresh, items: FULL,    notes: 'Post-weekend deep clean complete.'                 },
        { daysBack: 4, hour: 10, sup: meera,  items: FULL,    notes: 'All washrooms inspected and cleared.'              },
    ];

    const checklistRows = [];
    for (const w of newH2Washrooms) {
        for (const t of templates) {
            const at = atHour(daysAgo(t.daysBack), t.hour);
            checklistRows.push({
                washroom_id:     w.id,
                supervisor_id:   t.sup.id,
                checklist_date:  at.toISOString().split('T')[0],
                checklist_items: JSON.stringify(t.items),
                notes:           t.notes,
                submitted_at:    at,
                created_at:      at,
                updated_at:      at,
            });
        }
    }

    for (let i = 0; i < checklistRows.length; i += 50) {
        await knex('washroom_checklists').insert(checklistRows.slice(i, i + 50));
    }

    // ── Update facility_updates for H2 floors 3-9 washrooms ─────────────────
    const washroomTypes = ['Washroom', 'Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'];
    for (let floor = 3; floor <= 9; floor++) {
        const supervisor = floor % 2 === 0 ? meera : suresh;
        await knex('facility_updates')
            .where('building', 'H2 Hostel')
            .where('floor', String(floor))
            .whereIn('facility_type', washroomTypes)
            .update({
                cleaned:         'Yes',
                last_updated:    atHour(daysAgo(floor % 3), 9 + (floor % 4)),
                updated_by:      supervisor.name,
                checklist_items: JSON.stringify({ floor_mopping: true, sink_cleaning: true, dustbin_cleared: floor % 2 === 0, soap_refill: true, tissue_refill: floor % 3 !== 0, sanitizer_refill: floor % 2 === 0 }),
            });
    }
};

exports.down = async function down(knex) {
    const ids = await knex('washrooms').where('building', 'H2').where('floor', '>=', 3).pluck('id');
    if (ids.length) await knex('washroom_checklists').whereIn('washroom_id', ids).delete();
    await knex('washrooms').where('building', 'H2').where('floor', '>=', 3).delete();
};
