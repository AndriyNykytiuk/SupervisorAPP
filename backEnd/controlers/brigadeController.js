import { Brigade, Detachment } from '../models/index.js'

// GET /api/brigades — scoped by role
export const getAll = async (req, res, next) => {
    try {
        // GOD: see all
        if (!req.scope) {
            const brigades = await Brigade.findAll({ include: Detachment })
            return res.json(brigades)
        }

        // SEMI-GOD: see only brigades in their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                include: Detachment,
            })
            return res.json(brigades)
        }

        // RW: no access to brigade list
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// GET /api/brigades/:id — scoped by role
export const getById = async (req, res, next) => {
    try {
        const brigade = await Brigade.findByPk(req.params.id, { include: Detachment })
        if (!brigade) return res.status(404).json({ error: 'Brigade not found' })

        // GOD: see any
        if (!req.scope) return res.json(brigade)

        // SEMI-GOD: only brigades in their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            if (brigade.detachmentId !== req.scope.detachmentId) {
                return res.status(403).json({ error: 'Forbidden: not in your detachment' })
            }
            return res.json(brigade)
        }

        // RW: no access
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// POST /api/brigades — GOD only (authorize middleware ensures this)
export const create = async (req, res, next) => {
    try {
        const brigade = await Brigade.create(req.body)
        res.status(201).json(brigade)
    } catch (err) {
        next(err)
    }
}

// PUT /api/brigades/:id — GOD only
export const update = async (req, res, next) => {
    try {
        const brigade = await Brigade.findByPk(req.params.id)
        if (!brigade) return res.status(404).json({ error: 'Brigade not found' })
        await brigade.update(req.body)
        res.json(brigade)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/brigades/:id — GOD only
export const remove = async (req, res, next) => {
    try {
        const brigade = await Brigade.findByPk(req.params.id)
        if (!brigade) return res.status(404).json({ error: 'Brigade not found' })
        await brigade.destroy()
        res.json({ message: 'Brigade deleted' })
    } catch (err) {
        next(err)
    }
}
