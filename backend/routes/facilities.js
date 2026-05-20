const express = require('express');
const fs = require('fs');
const multer = require('multer');
const db = require('../database/postgres');
const config = require('../config');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

const uploadDir = config.upload.dir;
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

function formatDateTimeForFilename(date = new Date()) {
    const pad2 = (num) => String(num).padStart(2, '0');

    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}_${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
}

function safeUnlink(filePath) {
    if (!filePath) return;
    fs.unlink(filePath, () => {});
}

const CHECKLIST_ITEM_KEYS = ['floor_mopping', 'sink_cleaning', 'dustbin_cleared', 'soap_refill', 'tissue_refill', 'sanitizer_refill'];

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const facilityId = String(req.params.id || 'unknown').replace(/[^a-z0-9_-]/gi, '_');
        const fieldSuffix = file.fieldname !== 'photo' ? `_${file.fieldname.replace(/[^a-z0-9_]/gi, '_')}` : '';
        cb(null, `facility_${facilityId}${fieldSuffix}_${formatDateTimeForFilename(new Date())}.jpg`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: config.upload.maxSize },
    fileFilter: (_req, file, cb) => {
        if (config.upload.allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
        }
    },
});

router.get('/', async (req, res, next) => {
    try {
        const { building, floor } = req.query;

        if (!building || !floor) {
            return res.status(400).json({ error: 'building and floor are required' });
        }

        const facilities = await db('facility_updates')
            .where({ building, floor })
            .orderBy([
                { column: 'facility_type', order: 'asc' },
                { column: 'facility_number', order: 'asc' },
            ]);

        res.json(facilities);
    } catch (error) {
        next(error);
    }
});

router.get('/log', async (req, res, next) => {
    try {
        const { building, floor, facility_type: facilityType } = req.query;

        if (!building || !floor) {
            return res.status(400).json({ error: 'building and floor are required' });
        }

        let query = db('facility_updates')
            .where({ building, floor })
            .whereNotNull('cleaned');

        if (facilityType) {
            query = query.where('facility_type', facilityType);
        }

        const facilities = await query.orderBy('last_updated', 'desc');
        res.json(facilities);
    } catch (error) {
        next(error);
    }
});

const WASHROOM_FACILITY_TYPES = ['Washroom', 'Washroom (Male)', 'Washroom (Female)', 'Washroom (Inclusive)'];

router.get('/washroom-updates', requireRole('admin', 'supervisor'), async (req, res, next) => {
    try {
        const { building, floor, date } = req.query;
        if (!building) return res.status(400).json({ error: 'building is required' });

        let query = db('facility_updates')
            .whereIn('facility_type', WASHROOM_FACILITY_TYPES)
            .where('building', building)
            .whereNotNull('last_updated')
            .orderBy('last_updated', 'desc');

        if (floor !== undefined && floor !== '') {
            const floorVal = floor === '0' ? 'G' : floor;
            query = query.where('floor', floorVal);
        }
        if (date) query = query.whereRaw('DATE(last_updated) = ?', [date]);

        const rows = await query.limit(100);
        res.json(rows.map(r => {
            const items = r.checklist_items
                ? (typeof r.checklist_items === 'string' ? JSON.parse(r.checklist_items) : r.checklist_items)
                : null;
            return {
                building: r.building,
                floor: r.floor,
                washroom_label: `${r.facility_type} #${r.facility_number}`,
                submitted_at: r.last_updated,
                supervisor_name: r.updated_by,
                photo_url: r.photo_url || null,
                comment: r.comment || null,
                checklist_items: items,
                notes: r.cleaned === 'yes' ? 'Cleaned ✓' : r.cleaned === 'no' ? 'Not cleaned' : null,
            };
        }));
    } catch (error) {
        next(error);
    }
});

router.put('/:id', requireRole('supervisor'), upload.any(), async (req, res, next) => {
    const allFiles = () => Array.isArray(req.files) ? req.files : [];
    try {
        const cleaned = String(req.body.cleaned || '').trim().toLowerCase();
        const comment = String(req.body.comment || '').trim();
        const files = allFiles();
        const mainFile = files.find(f => f.fieldname === 'photo') || null;
        const itemFileMap = new Map(
            files.filter(f => f.fieldname.startsWith('photo_')).map(f => [f.fieldname.slice(6), f])
        );

        let parsedItems = null;
        if (req.body.items) {
            try { parsedItems = JSON.parse(req.body.items); } catch (_) { /* ignore */ }
        }

        if (!['yes', 'no'].includes(cleaned)) {
            files.forEach(f => safeUnlink(f.path));
            return res.status(400).json({ error: "cleaned must be 'yes' or 'no'" });
        }

        const facility = await db('facility_updates').where('id', req.params.id).first();
        if (!facility) {
            files.forEach(f => safeUnlink(f.path));
            return res.status(404).json({ error: 'Facility update row not found' });
        }

        if (cleaned === 'yes' && !mainFile && itemFileMap.size === 0) {
            return res.status(400).json({ error: 'Photo proof is required when marking as cleaned' });
        }

        if (cleaned === 'no' && files.length > 0) {
            files.forEach(f => safeUnlink(f.path));
            return res.status(400).json({ error: 'Photo proof is only accepted when marking as cleaned' });
        }

        if (cleaned === 'no' && !comment) {
            return res.status(400).json({ error: 'Comment is required when marking as not cleaned' });
        }

        const updates = {
            cleaned,
            last_updated: db.fn.now(),
            updated_by: req.user.name,
            updated_at: db.fn.now(),
        };

        if (cleaned === 'yes') {
            if (mainFile) updates.photo_url = `/uploads/${mainFile.filename}`;
            updates.comment = null;

            if (parsedItems && itemFileMap.size > 0) {
                const normalizedItems = {};
                CHECKLIST_ITEM_KEYS.forEach((key) => {
                    const incoming = parsedItems[key] || {};
                    const completed = incoming.completed === true || incoming.completed === 'true';
                    const file = itemFileMap.get(key) || null;
                    normalizedItems[key] = {
                        completed,
                        photo_url: file ? `/uploads/${file.filename}` : null,
                        completed_at: completed ? new Date().toISOString() : null,
                        comment: !completed ? (String(incoming.comment || '').trim() || null) : null,
                    };
                });
                updates.checklist_items = normalizedItems;
            } else {
                updates.checklist_items = null;
            }
        } else {
            updates.photo_url = null;
            updates.comment = comment;
            updates.checklist_items = null;
        }

        await db('facility_updates').where('id', req.params.id).update(updates);
        const updated = await db('facility_updates').where('id', req.params.id).first();
        res.json(updated);
    } catch (error) {
        allFiles().forEach(f => safeUnlink(f.path));
        next(error);
    }
});

module.exports = router;
