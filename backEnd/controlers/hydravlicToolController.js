import { HydravlicTool, Brigade } from '../models/index.js'

// Отримання всіх генераторів з урахуванням ролі
export const getAll = async (req, res, next) => {
    try {
        // У GOD req.scope === null (бачить все)
        if (!req.scope) {
            const items = await HydravlicTool.findAll({ include: [Brigade] })
            return res.json(items)
        }

        // У SEMI-GOD є req.scope.detachmentId
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id'],
            })
            const brigadeIds = brigades.map((b) => b.id)

            const items = await HydravlicTool.findAll({
                where: { brigadeId: brigadeIds },
                include: [Brigade],
            })
            return res.json(items)
        }

        // У RW є req.scope.brigadeId
        if (req.scope.brigadeId) {
            const items = await HydravlicTool.findAll({
                where: { brigadeId: req.scope.brigadeId },
                include: [Brigade],
            })
            return res.json(items)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// Отримання конкретного елемента
export const getById = async (req, res, next) => {
    try {
        const item = await HydravlicTool.findByPk(req.params.id, { include: [Brigade] })
        if (!item) return res.status(404).json({ error: 'Item not found' })

        // Перевірка прав для SEMI-GOD та RW (без req.scope означає GOD = пускаємо)
        if (req.scope) {
            if (req.scope.brigadeId && item.brigadeId !== req.scope.brigadeId) {
                return res.status(403).json({ error: 'Forbidden' })
            }
            if (req.scope.detachmentId && !req.scope.brigadeId) {
                const brigade = await Brigade.findByPk(item.brigadeId)
                if (brigade.detachmentId !== req.scope.detachmentId) {
                    return res.status(403).json({ error: 'Forbidden' })
                }
            }
        }

        res.json(item)
    } catch (err) {
        next(err)
    }
}

// Отримання всіх станцій для однієї бригади (використовується на формі Toolscomponent)
export const getByBrigade = async (req, res, next) => {
    try {
        const { brigadeId } = req.params

        // Перевіряємо права
        if (req.scope?.brigadeId && req.scope.brigadeId != brigadeId) {
            return res.status(403).json({ error: 'Forbidden: can only read your own brigade' })
        }
        if (req.scope?.detachmentId && !req.scope.brigadeId) {
            const brigade = await Brigade.findByPk(brigadeId)
            if (!brigade || brigade.detachmentId !== req.scope.detachmentId) {
                return res.status(403).json({ error: 'Forbidden: brigade is outside your detachment' })
            }
        }

        const items = await HydravlicTool.findAll({ where: { brigadeId } })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

// Створення запису
export const create = async (req, res, next) => {
    try {
        // SEMI-GOD: read-only
        if (req.scope?.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        let targetBrigadeId = req.body.brigadeId
        if (req.user.role === 'RW') {
            targetBrigadeId = req.user.brigadeId
        }

        const newItem = await HydravlicTool.create({
            ...req.body,
            brigadeId: targetBrigadeId
        })
        res.status(201).json(newItem)
    } catch (err) {
        next(err)
    }
}

// Оновлення запису
export const update = async (req, res, next) => {
    try {
        const item = await HydravlicTool.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Item not found' })

        // SEMI-GOD: read-only
        if (req.scope?.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const { brigadeId, id, ...allowedUpdates } = req.body
        await item.update(allowedUpdates)
        res.json(item)
    } catch (err) {
        next(err)
    }
}

// Видалення запису
export const remove = async (req, res, next) => {
    try {
        const item = await HydravlicTool.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Item not found' })

        // SEMI-GOD: read-only
        if (req.scope?.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        await item.destroy()
        res.status(204).end()
    } catch (err) {
        next(err)
    }
}
