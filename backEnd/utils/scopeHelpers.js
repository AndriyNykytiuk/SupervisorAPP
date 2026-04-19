import { Brigade } from '../models/index.js'

export async function buildScopedWhere(scope) {
    if (!scope) return {}
    if (scope.detachmentId && !scope.brigadeId) {
        const brigades = await Brigade.findAll({
            where: { detachmentId: scope.detachmentId },
            attributes: ['id'],
        })
        return { brigadeId: brigades.map(b => b.id) }
    }
    if (scope.brigadeId) return { brigadeId: scope.brigadeId }
    throw new Error('Invalid scope state')
}

export function isSemiGodReadOnly(scope, res) {
    if (scope?.detachmentId && !scope.brigadeId) {
        res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        return true
    }
    return false
}

export async function checkBrigadeAccess(scope, itemBrigadeId, res) {
    if (!scope) return true
    if (scope.brigadeId) {
        if (itemBrigadeId !== scope.brigadeId) {
            res.status(403).json({ error: 'Forbidden' })
            return false
        }
        return true
    }
    if (scope.detachmentId && !scope.brigadeId) {
        const brigade = await Brigade.findByPk(itemBrigadeId)
        if (!brigade || brigade.detachmentId !== scope.detachmentId) {
            res.status(403).json({ error: 'Forbidden' })
            return false
        }
        return true
    }
    return true
}

export async function checkByBrigadeAccess(scope, brigadeId, res) {
    if (scope?.brigadeId && scope.brigadeId !== Number(brigadeId)) {
        res.status(403).json({ error: 'Forbidden: can only read your own brigade' })
        return false
    }
    if (scope?.detachmentId && !scope.brigadeId) {
        const brigade = await Brigade.findByPk(brigadeId)
        if (!brigade || brigade.detachmentId !== scope.detachmentId) {
            res.status(403).json({ error: 'Forbidden: brigade is outside your detachment' })
            return false
        }
    }
    return true
}

export function createBrigadeScopedController(Model) {
    return {
        getAll: async (req, res, next) => {
            try {
                const where = await buildScopedWhere(req.scope)
                const items = await Model.findAll({ where, include: [Brigade] })
                res.json(items)
            } catch (err) { next(err) }
        },

        getById: async (req, res, next) => {
            try {
                const item = await Model.findByPk(req.params.id, { include: [Brigade] })
                if (!item) return res.status(404).json({ error: 'Item not found' })
                const ok = await checkBrigadeAccess(req.scope, item.brigadeId, res)
                if (ok) res.json(item)
            } catch (err) { next(err) }
        },

        getByBrigade: async (req, res, next) => {
            try {
                const { brigadeId } = req.params
                const ok = await checkByBrigadeAccess(req.scope, brigadeId, res)
                if (!ok) return
                const items = await Model.findAll({ where: { brigadeId } })
                res.json(items)
            } catch (err) { next(err) }
        },

        create: async (req, res, next) => {
            try {
                if (isSemiGodReadOnly(req.scope, res)) return
                const brigadeId = req.user.role === 'RW' ? req.user.brigadeId : req.body.brigadeId
                const item = await Model.create({ ...req.body, brigadeId })
                res.status(201).json(item)
            } catch (err) { next(err) }
        },

        update: async (req, res, next) => {
            try {
                const item = await Model.findByPk(req.params.id)
                if (!item) return res.status(404).json({ error: 'Item not found' })
                if (isSemiGodReadOnly(req.scope, res)) return
                if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
                    return res.status(403).json({ error: 'Forbidden' })
                }
                const { brigadeId, id, ...allowed } = req.body
                await item.update(allowed)
                res.json(item)
            } catch (err) { next(err) }
        },

        remove: async (req, res, next) => {
            try {
                const item = await Model.findByPk(req.params.id)
                if (!item) return res.status(404).json({ error: 'Item not found' })
                if (isSemiGodReadOnly(req.scope, res)) return
                if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
                    return res.status(403).json({ error: 'Forbidden' })
                }
                await item.destroy()
                res.status(204).end()
            } catch (err) { next(err) }
        },
    }
}
