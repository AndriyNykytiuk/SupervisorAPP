import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import multer from 'multer'
import { EquipmentDocument } from '../models/index.js'
import { resolveEquipmentBrigadeId, userHasBrigadeAccess } from '../utils/equipmentAccess.js'

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads', 'equipment-documents')

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, _file, cb) => {
        const ext = '.pdf'
        const name = `${crypto.randomUUID()}${ext}`
        cb(null, name)
    },
})

export const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Дозволено тільки PDF'))
        }
        cb(null, true)
    },
}).single('file')

// POST /api/equipment-documents/bulk — one file, many equipment items
export const uploadBulk = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Файл не надіслано' })

        const { equipmentType, equipmentIds, documentName } = req.body
        let ids = []
        try { ids = JSON.parse(equipmentIds || '[]') } catch { ids = [] }

        if (!equipmentType || !Array.isArray(ids) || ids.length === 0) {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'equipmentType та equipmentIds обовʼязкові' })
        }

        // Resolve and verify access for each item
        const resolvedBrigadeIds = await Promise.all(
            ids.map((id) => resolveEquipmentBrigadeId(equipmentType, Number(id)))
        )
        if (resolvedBrigadeIds.some((b) => !b)) {
            fs.unlinkSync(req.file.path)
            return res.status(404).json({ error: 'Деяке обладнання не знайдено' })
        }
        const accessChecks = await Promise.all(
            resolvedBrigadeIds.map((b) => userHasBrigadeAccess(req.user, b))
        )
        if (accessChecks.some((ok) => !ok)) {
            fs.unlinkSync(req.file.path)
            return res.status(403).json({ error: 'Немає доступу до частини обладнання' })
        }

        // verify PDF magic bytes
        const fd = fs.openSync(req.file.path, 'r')
        const buf = Buffer.alloc(4)
        fs.readSync(fd, buf, 0, 4, 0)
        fs.closeSync(fd)
        if (buf.toString('ascii') !== '%PDF') {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'Файл не схожий на PDF' })
        }

        const docs = await EquipmentDocument.bulkCreate(
            ids.map((id, idx) => ({
                equipmentType,
                equipmentId: Number(id),
                brigadeId: resolvedBrigadeIds[idx],
                documentName: documentName || req.file.originalname,
                originalFilename: req.file.originalname,
                storedFilename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                uploadedByUserId: req.user?.id || null,
                uploadedByUserName: req.user?.name || null,
            }))
        )
        res.status(201).json(docs)
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path) } catch {}
        }
        next(err)
    }
}

// POST /api/equipment-documents
export const upload = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Файл не надіслано' })

        const { equipmentType, equipmentId, documentName } = req.body
        if (!equipmentType || !equipmentId) {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'equipmentType і equipmentId обовʼязкові' })
        }

        // Resolve real brigadeId from the equipment itself (don't trust client)
        const realBrigadeId = await resolveEquipmentBrigadeId(equipmentType, Number(equipmentId))
        if (!realBrigadeId) {
            fs.unlinkSync(req.file.path)
            return res.status(404).json({ error: 'Обладнання не знайдено' })
        }
        const allowed = await userHasBrigadeAccess(req.user, realBrigadeId)
        if (!allowed) {
            fs.unlinkSync(req.file.path)
            return res.status(403).json({ error: 'Немає доступу до цього обладнання' })
        }

        // optional: verify magic bytes for PDF
        const fd = fs.openSync(req.file.path, 'r')
        const buf = Buffer.alloc(4)
        fs.readSync(fd, buf, 0, 4, 0)
        fs.closeSync(fd)
        if (buf.toString('ascii') !== '%PDF') {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'Файл не схожий на PDF' })
        }

        const doc = await EquipmentDocument.create({
            equipmentType,
            equipmentId: Number(equipmentId),
            brigadeId: realBrigadeId,
            documentName: documentName || req.file.originalname,
            originalFilename: req.file.originalname,
            storedFilename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedByUserId: req.user?.id || null,
            uploadedByUserName: req.user?.name || null,
        })

        res.status(201).json(doc)
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path) } catch {}
        }
        next(err)
    }
}

// GET /api/equipment-documents?equipmentType=X&equipmentId=Y
export const list = async (req, res, next) => {
    try {
        const where = {}
        if (req.query.equipmentType) where.equipmentType = req.query.equipmentType
        if (req.query.equipmentId) where.equipmentId = Number(req.query.equipmentId)
        if (req.query.brigadeId) where.brigadeId = Number(req.query.brigadeId)

        const docs = await EquipmentDocument.findAll({
            where,
            order: [['createdAt', 'DESC']],
        })

        // Filter by user's access (skip docs for brigades they can't see)
        const filtered = []
        for (const doc of docs) {
            if (!doc.brigadeId) { filtered.push(doc); continue }
            if (await userHasBrigadeAccess(req.user, doc.brigadeId)) {
                filtered.push(doc)
            }
        }
        res.json(filtered)
    } catch (err) {
        next(err)
    }
}

// GET /api/equipment-documents/:id/download
export const download = async (req, res, next) => {
    try {
        const doc = await EquipmentDocument.findByPk(req.params.id)
        if (!doc) return res.status(404).json({ error: 'Документ не знайдено' })

        if (doc.brigadeId) {
            const allowed = await userHasBrigadeAccess(req.user, doc.brigadeId)
            if (!allowed) return res.status(403).json({ error: 'Немає доступу' })
        }

        const filePath = path.join(UPLOADS_DIR, doc.storedFilename)
        if (!fs.existsSync(filePath)) {
            return res.status(410).json({ error: 'Файл відсутній на диску' })
        }

        res.setHeader('Content-Type', doc.mimetype)
        const safeName = encodeURIComponent(doc.originalFilename)
        res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${safeName}`)
        fs.createReadStream(filePath).pipe(res)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/equipment-documents/:id
export const remove = async (req, res, next) => {
    try {
        const doc = await EquipmentDocument.findByPk(req.params.id)
        if (!doc) return res.status(404).json({ error: 'Документ не знайдено' })

        if (doc.brigadeId) {
            const allowed = await userHasBrigadeAccess(req.user, doc.brigadeId)
            if (!allowed) return res.status(403).json({ error: 'Немає доступу' })
        }

        const storedFilename = doc.storedFilename
        await doc.destroy()

        // remove physical file only if no other records still reference it
        const otherRefs = await EquipmentDocument.count({ where: { storedFilename } })
        if (otherRefs === 0) {
            const filePath = path.join(UPLOADS_DIR, storedFilename)
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath) } catch {}
            }
        }
        res.status(204).end()
    } catch (err) {
        next(err)
    }
}
