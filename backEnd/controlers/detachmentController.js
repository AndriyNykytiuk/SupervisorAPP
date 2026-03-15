import { Detachment, Brigade } from '../models/index.js'

// GET /api/detachments — scoped by role
export const getAll = async (req, res, next) => {
    try {
        // GOD: req.scope is null → see all
        if (!req.scope) {
            const detachments = await Detachment.findAll({ include: Brigade })
            return res.json(detachments)
        }

        // SEMI-GOD: see only their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const detachment = await Detachment.findByPk(req.scope.detachmentId, {
                include: Brigade,
            })
            return res.json(detachment ? [detachment] : [])
        }

        // RW: no access to detachments
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// GET /api/detachments/:id — scoped by role
export const getById = async (req, res, next) => {
    try {
        const detachment = await Detachment.findByPk(req.params.id, { include: Brigade })
        if (!detachment) return res.status(404).json({ error: 'Detachment not found' })

        // GOD: see any
        if (!req.scope) return res.json(detachment)

        // SEMI-GOD: only their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            if (detachment.id !== req.scope.detachmentId) {
                return res.status(403).json({ error: 'Forbidden: not your detachment' })
            }
            return res.json(detachment)
        }

        // RW: no access
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// POST /api/detachments — GOD only
export const create = async (req, res, next) => {
    try {
        const detachment = await Detachment.create(req.body)
        res.status(201).json(detachment)
    } catch (err) {
        next(err)
    }
}

// PUT /api/detachments/:id — GOD only
export const update = async (req, res, next) => {
    try {
        const detachment = await Detachment.findByPk(req.params.id)
        if (!detachment) return res.status(404).json({ error: 'Detachment not found' })
        await detachment.update(req.body)
        res.json(detachment)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/detachments/:id — GOD only
export const remove = async (req, res, next) => {
    try {
        const detachment = await Detachment.findByPk(req.params.id)
        if (!detachment) return res.status(404).json({ error: 'Detachment not found' })
        await detachment.destroy()
        res.json({ message: 'Detachment deleted' })
    } catch (err) {
        next(err)
    }
}
