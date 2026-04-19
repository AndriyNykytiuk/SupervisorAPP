import { UsageLiquidsLog, Brigade } from '../models/index.js'

export const getAll = async (req, res, next) => {
    try {
        if (!req.scope) {
            const items = await UsageLiquidsLog.findAll({ include: [Brigade] })
            return res.json(items)
        }
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigades = await Brigade.findAll({ where: { detachmentId: req.scope.detachmentId }, attributes: ['id'] })
            const brigadeIds = brigades.map(b => b.id)
            const items = await UsageLiquidsLog.findAll({ where: { brigadeId: brigadeIds }, include: [Brigade] })
            return res.json(items)
        }
        if (req.scope.brigadeId) {
            const items = await UsageLiquidsLog.findAll({ where: { brigadeId: req.scope.brigadeId }, include: [Brigade] })
            return res.json(items)
        }
        return res.status(403).json({ error: 'Forbidden' })
    } catch (err) { next(err) }
}

export const getById = async (req, res, next) => {
    try {
        const item = await UsageLiquidsLog.findByPk(req.params.id, { include: [Brigade] })
        if (!item) return res.status(404).json({ error: 'Not found' })
        if (req.scope?.brigadeId && item.brigadeId !== req.scope.brigadeId) return res.status(403).json({ error: 'Forbidden' })

        if (req.scope?.detachmentId && !req.scope.brigadeId) {
            const brigade = await Brigade.findByPk(item.brigadeId)
            if (!brigade || brigade.detachmentId !== req.scope.detachmentId) {
                return res.status(403).json({ error: 'Forbidden' })
            }
        }
        res.json(item)
    } catch (err) { next(err) }
}

export const getByBrigade = async (req, res, next) => {
    try {
        const { brigadeId } = req.params
        if (req.scope?.brigadeId && req.scope.brigadeId !== Number(brigadeId)) return res.status(403).json({ error: 'Forbidden' })
        if (req.scope?.detachmentId && !req.scope.brigadeId) {
            const brigade = await Brigade.findByPk(brigadeId)
            if (!brigade || brigade.detachmentId !== req.scope.detachmentId) return res.status(403).json({ error: 'Forbidden' })
        }
        const items = await UsageLiquidsLog.findAll({ where: { brigadeId }, order: [['date', 'DESC']] })
        res.json(items)
    } catch (err) { next(err) }
}

export const create = async (req, res, next) => {
    try {
        // SEMI-GOD: read-only
        if (req.scope?.detachmentId && !req.scope.brigadeId) return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })

        let targetBrigadeId = req.body.brigadeId
        if (req.user.role === 'RW') targetBrigadeId = req.user.brigadeId

        const newItem = await UsageLiquidsLog.create({
            volume: req.body.volume,
            date: req.body.date,
            substance: req.body.substance,
            eventType: req.body.eventType,
            address: req.body.address,
            brigadeId: targetBrigadeId
        })
        res.status(201).json(newItem)
    } catch (err) { next(err) }
}

export const update = async (req, res, next) => {
    try {
        const item = await UsageLiquidsLog.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Not found' })
        if (req.scope?.detachmentId && !req.scope.brigadeId) return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) return res.status(403).json({ error: 'Forbidden' })
        const { brigadeId, id, ...allowed } = req.body
        await item.update(allowed)
        res.json(item)
    } catch (err) { next(err) }
}

export const remove = async (req, res, next) => {
    try {
        const item = await UsageLiquidsLog.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Not found' })
        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) return res.status(403).json({ error: 'Forbidden' })
        await item.destroy()
        res.status(204).end()
    } catch (err) { next(err) }
}
