import { ToolItem, toolList, Brigade } from '../models/index.js'

// GET /api/tool-items — scoped by role
export const getAll = async (req, res, next) => {
    try {
        if (!req.scope) {
            const items = await ToolItem.findAll({ include: [toolList, Brigade] })
            return res.json(items)
        }

        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id'],
            })
            const brigadeIds = brigades.map((b) => b.id)
            const items = await ToolItem.findAll({
                where: { brigadeId: brigadeIds },
                include: [toolList, Brigade],
            })
            return res.json(items)
        }

        if (req.scope.brigadeId) {
            const items = await ToolItem.findAll({
                where: { brigadeId: req.scope.brigadeId },
                include: [toolList, Brigade],
            })
            return res.json(items)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// GET /api/tool-items/:id — scoped by role
export const getById = async (req, res, next) => {
    try {
        const item = await ToolItem.findByPk(req.params.id, { include: [toolList, Brigade] })
        if (!item) return res.status(404).json({ error: 'Tool item not found' })

        if (!req.scope) return res.json(item)

        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigade = await Brigade.findByPk(item.brigadeId)
            if (!brigade || brigade.detachmentId !== req.scope.detachmentId) {
                return res.status(403).json({ error: 'Forbidden: not in your detachment' })
            }
            return res.json(item)
        }

        if (req.scope.brigadeId) {
            if (item.brigadeId !== req.scope.brigadeId) {
                return res.status(403).json({ error: 'Forbidden: not your brigade' })
            }
            return res.json(item)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// GET /api/tool-items/brigade/:brigadeId — grouped by toolList
export const getByBrigade = async (req, res, next) => {
    try {
        const lists = await toolList.findAll({
            include: {
                model: ToolItem,
                where: { brigadeId: req.params.brigadeId },
                required: false,
            },
        })
        res.json(lists)
    } catch (err) {
        next(err)
    }
}

// GET /api/tool-items/brigade/:brigadeId/tool-list/:toolListId
export const getByBrigadeAndList = async (req, res, next) => {
    try {
        const items = await ToolItem.findAll({
            where: {
                brigadeId: req.params.brigadeId,
                toolListId: req.params.toolListId,
            },
            include: [toolList, Brigade],
        })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

// POST /api/tool-items
export const create = async (req, res, next) => {
    try {
        if (!req.scope) {
            const item = await ToolItem.create(req.body)
            return res.status(201).json(item)
        }

        if (req.scope.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        if (req.scope.brigadeId) {
            const item = await ToolItem.create({
                ...req.body,
                brigadeId: req.scope.brigadeId,
            })
            return res.status(201).json(item)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// PUT /api/tool-items/:id
export const update = async (req, res, next) => {
    try {
        const item = await ToolItem.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Tool item not found' })

        if (!req.scope) {
            await item.update(req.body)
            return res.json(item)
        }

        if (req.scope.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        if (req.scope.brigadeId) {
            if (item.brigadeId !== req.scope.brigadeId) {
                return res.status(403).json({ error: 'Forbidden: not your brigade' })
            }
            const { brigadeId, id, ...allowedUpdates } = req.body
            await item.update(allowedUpdates)
            return res.json(item)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// DELETE /api/tool-items/:id
export const remove = async (req, res, next) => {
    try {
        const item = await ToolItem.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Tool item not found' })

        if (!req.scope) {
            await item.destroy()
            return res.json({ message: 'Tool item deleted' })
        }

        if (req.scope.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        if (req.scope.brigadeId) {
            if (item.brigadeId !== req.scope.brigadeId) {
                return res.status(403).json({ error: 'Forbidden: not your brigade' })
            }
            await item.destroy()
            return res.json({ message: 'Tool item deleted' })
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// PUT /api/tool-items/transfer
export const transfer = async (req, res, next) => {
    try {
        const { itemIds, toBrigadeId } = req.body

        if (!toBrigadeId) {
            return res.status(400).json({ error: 'toBrigadeId is required' })
        }
        if (!itemIds || (Array.isArray(itemIds) && itemIds.length === 0)) {
            return res.status(400).json({ error: 'itemIds is required' })
        }

        const ids = Array.isArray(itemIds) ? itemIds : [itemIds]

        const targetBrigade = await Brigade.findByPk(toBrigadeId)
        if (!targetBrigade) {
            return res.status(404).json({ error: 'Target brigade not found' })
        }

        const items = await ToolItem.findAll({ where: { id: ids } })
        if (items.length === 0) {
            return res.status(404).json({ error: 'No tool items found' })
        }

        await ToolItem.update({ brigadeId: toBrigadeId }, { where: { id: ids } })

        const updated = await ToolItem.findAll({
            where: { id: ids },
            include: [toolList, Brigade],
        })

        res.json(updated)
    } catch (err) {
        next(err)
    }
}
