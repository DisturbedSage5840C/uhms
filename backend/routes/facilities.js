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

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, _file, cb) => {
        const facilityId = String(req.params.id || 'unknown').replace(/[^a-z0-9_-]/gi, '_');
        cb(null, `facility_${facilityId}_${formatDateTimeForFilename(new Date())}.jpg`);
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

router.put('/:id', requireRole('supervisor'), upload.single('photo'), async (req, res, next) => {
    try {
        const cleaned = String(req.body.cleaned || '').trim().toLowerCase();
        const comment = String(req.body.comment || '').trim();

        if (!['yes', 'no'].includes(cleaned)) {
            safeUnlink(req.file?.path);
            return res.status(400).json({ error: "cleaned must be 'yes' or 'no'" });
        }

        const facility = await db('facility_updates').where('id', req.params.id).first();
        if (!facility) {
            safeUnlink(req.file?.path);
            return res.status(404).json({ error: 'Facility update row not found' });
        }

        if (cleaned === 'yes' && !req.file) {
            return res.status(400).json({ error: 'Photo proof is required when marking as cleaned' });
        }

        if (cleaned === 'no' && req.file) {
            safeUnlink(req.file.path);
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
            updates.photo_url = `/uploads/${req.file.filename}`;
            updates.comment = null;
        } else {
            updates.photo_url = null;
            updates.comment = comment;
        }

        await db('facility_updates')
            .where('id', req.params.id)
            .update(updates);

        const updated = await db('facility_updates').where('id', req.params.id).first();
        res.json(updated);
    } catch (error) {
        safeUnlink(req.file?.path);
        next(error);
    }
});

module.exports = router;
