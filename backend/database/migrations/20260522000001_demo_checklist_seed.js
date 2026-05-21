/**
 * Seeds realistic demo washroom checklist submissions and facility update records
 * so the admin dashboard shows meaningful data on first cloud deployment.
 */

exports.up = async function up(knex) {
    // ── Supervisors ──────────────────────────────────────────────────────────
    const meera  = await knex('users').where('email', 'meera@hostel.com').first('id', 'name');
    const suresh = await knex('users').where('email', 'suresh@hostel.com').first('id', 'name');
    if (!meera || !suresh) return; // guard: seed hasn't run yet

    // ── Washrooms (H1/H2/H3, building stored as short code) ─────────────────
    const washrooms = await knex('washrooms')
        .whereIn('building', ['H1', 'H2', 'H3'])
        .select('id', 'building', 'floor', 'direction', 'label');

    if (washrooms.length === 0) return; // guard

    // ── Helper ───────────────────────────────────────────────────────────────
    const daysAgo = (n) => new Date(Date.now() - n * 86400000);
    const atHour  = (date, h) => { const d = new Date(date); d.setHours(h, 0, 0, 0); return d; };

    const FULL    = { soap_refill: true,  tissue_refill: true,  sanitizer_refill: true,  sink_cleaning: true,  floor_mopping: true,  dustbin_cleared: true  };
    const PARTIAL = { soap_refill: true,  tissue_refill: false, sanitizer_refill: true,  sink_cleaning: true,  floor_mopping: true,  dustbin_cleared: true  };
    const LOW     = { soap_refill: false, tissue_refill: true,  sanitizer_refill: false, sink_cleaning: true,  floor_mopping: true,  dustbin_cleared: false };

    const submissionTemplates = [
        { daysBack: 0, hour: 8,  supervisor: meera,  items: FULL,    notes: 'Morning rounds complete. All supplies stocked.'           },
        { daysBack: 0, hour: 14, supervisor: suresh, items: PARTIAL, notes: 'Afternoon check. Tissue running low on floor 1.'          },
        { daysBack: 1, hour: 8,  supervisor: meera,  items: FULL,    notes: 'Morning check. Good condition.'                           },
        { daysBack: 1, hour: 20, supervisor: suresh, items: LOW,     notes: 'Evening check. Soap and sanitizer need restocking.'       },
        { daysBack: 2, hour: 9,  supervisor: meera,  items: PARTIAL, notes: 'Tissue dispensers empty on ground floor.'                 },
        { daysBack: 2, hour: 18, supervisor: suresh, items: FULL,    notes: 'Evening round. Restocked all dispensers.'                 },
        { daysBack: 3, hour: 8,  supervisor: meera,  items: FULL,    notes: 'Weekly deep-clean complete.'                              },
        { daysBack: 4, hour: 9,  supervisor: suresh, items: LOW,     notes: 'Supply shortage reported to admin.'                      },
        { daysBack: 5, hour: 8,  supervisor: meera,  items: FULL,    notes: 'All washrooms inspected and cleared.'                    },
        { daysBack: 6, hour: 10, supervisor: suresh, items: PARTIAL, notes: 'Dustbin overflow in ground floor near parking lot.'       },
    ];

    // ── Build checklist rows ─────────────────────────────────────────────────
    const checklistRows = [];
    for (const w of washrooms) {
        // Use a subset of templates per washroom to avoid too many rows
        const templates = submissionTemplates.filter((_, i) => (w.floor + i) % 3 === 0 || i < 2);
        for (const t of templates) {
            const submittedAt = atHour(daysAgo(t.daysBack), t.hour);
            checklistRows.push({
                washroom_id:    w.id,
                supervisor_id:  t.supervisor.id,
                checklist_date: submittedAt.toISOString().split('T')[0],
                checklist_items: JSON.stringify(t.items),
                notes:          t.notes,
                submitted_at:   submittedAt,
                created_at:     submittedAt,
                updated_at:     submittedAt,
            });
        }
    }

    // Insert in batches of 50
    for (let i = 0; i < checklistRows.length; i += 50) {
        await knex('washroom_checklists').insert(checklistRows.slice(i, i + 50));
    }

    // ── Update facility_updates: mark H2 washroom facilities as cleaned ──────
    const washroomTypes = ['Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)', 'Washroom'];

    // Ground floor washrooms — updated by Meera today
    await knex('facility_updates')
        .where('building', 'H2 Hostel')
        .where('floor', 'G')
        .whereIn('facility_type', washroomTypes)
        .update({
            cleaned:       'Yes',
            last_updated:  atHour(daysAgo(0), 9),
            updated_by:    meera.name,
            checklist_items: JSON.stringify({ floor_mopping: true, sink_cleaning: true, dustbin_cleared: true, soap_refill: true, tissue_refill: true, sanitizer_refill: false }),
        });

    // Floor 1 washrooms — updated by Suresh yesterday
    await knex('facility_updates')
        .where('building', 'H2 Hostel')
        .where('floor', '1')
        .whereIn('facility_type', washroomTypes)
        .update({
            cleaned:       'Yes',
            last_updated:  atHour(daysAgo(1), 14),
            updated_by:    suresh.name,
            checklist_items: JSON.stringify({ floor_mopping: true, sink_cleaning: true, dustbin_cleared: false, soap_refill: true, tissue_refill: false, sanitizer_refill: true }),
        });

    // Floors 2-5 — partial coverage by Meera (3 days ago)
    await knex('facility_updates')
        .where('building', 'H2 Hostel')
        .whereIn('floor', ['2', '3', '4', '5'])
        .whereIn('facility_type', washroomTypes)
        .update({
            cleaned:       'Yes',
            last_updated:  atHour(daysAgo(3), 10),
            updated_by:    meera.name,
            checklist_items: JSON.stringify({ floor_mopping: true, sink_cleaning: true, dustbin_cleared: true, soap_refill: false, tissue_refill: true, sanitizer_refill: false }),
        });

    // A1 building washrooms — updated by Meera yesterday
    await knex('facility_updates')
        .where('building', 'A1-Bharti Academic Building')
        .whereIn('facility_type', washroomTypes)
        .update({
            cleaned:       'Yes',
            last_updated:  atHour(daysAgo(1), 11),
            updated_by:    meera.name,
            checklist_items: JSON.stringify({ floor_mopping: true, sink_cleaning: true, dustbin_cleared: true, soap_refill: true, tissue_refill: true, sanitizer_refill: true }),
        });

    // A4 building washrooms — updated by Suresh 2 days ago
    await knex('facility_updates')
        .where('building', 'A4-HDFC Innovation Hub')
        .whereIn('facility_type', washroomTypes)
        .update({
            cleaned:       'Yes',
            last_updated:  atHour(daysAgo(2), 9),
            updated_by:    suresh.name,
            checklist_items: JSON.stringify({ floor_mopping: true, sink_cleaning: true, dustbin_cleared: true, soap_refill: true, tissue_refill: true, sanitizer_refill: true }),
        });

    // A2 building washrooms — updated by Meera 2 days ago
    await knex('facility_updates')
        .where('building', 'A2-Havells Building')
        .whereIn('facility_type', washroomTypes)
        .update({
            cleaned:       'Yes',
            last_updated:  atHour(daysAgo(2), 13),
            updated_by:    meera.name,
            checklist_items: JSON.stringify({ floor_mopping: true, sink_cleaning: true, dustbin_cleared: true, soap_refill: true, tissue_refill: false, sanitizer_refill: true }),
        });
};

exports.down = async function down(knex) {
    await knex('washroom_checklists').delete();
    await knex('facility_updates').update({
        cleaned: null, last_updated: null, updated_by: null, checklist_items: null,
    });
};
