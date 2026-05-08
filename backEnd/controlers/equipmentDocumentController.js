import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import multer from 'multer'
import { EquipmentDocument } from '../models/index.js'

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

        const { equipmentType, equipmentIds, brigadeId, documentName } = req.body
        let ids = []
        try { ids = JSON.parse(equipmentIds || '[]') } catch { ids = [] }

        if (!equipmentType || !Array.isArray(ids) || ids.length === 0) {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'equipmentType та equipmentIds обовʼязкові' })
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
            ids.map((id) => ({
                equipmentType,
                equipmentId: Number(id),
                brigadeId: brigadeId ? Number(brigadeId) : null,
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

        const { equipmentType, equipmentId, brigadeId, documentName } = req.body
        if (!equipmentType || !equipmentId) {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'equipmentType і equipmentId обовʼязкові' })
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
            brigadeId: brigadeId ? Number(brigadeId) : null,
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
        res.json(docs)
    } catch (err) {
        next(err)
    }
}

// GET /api/equipment-documents/:id/download
export const download = async (req, res, next) => {
    try {
        const doc = await EquipmentDocument.findByPk(req.params.id)
        if (!doc) return res.status(404).json({ error: 'Документ не знайдено' })

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
