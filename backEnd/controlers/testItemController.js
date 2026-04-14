import { Op } from 'sequelize'
import { TestItem, testList, Brigade } from '../models/index.js'

// GET /api/test-items — scoped by role
export const getAll = async (req, res, next) => {
    try {
        // GOD: see all
        if (!req.scope) {
            const items = await TestItem.findAll({ include: [testList, Brigade] })
            return res.json(items)
        }

        // SEMI-GOD: see items from all brigades in their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id'],
            })
            const brigadeIds = brigades.map((b) => b.id)

            const items = await TestItem.findAll({
                where: { brigadeId: brigadeIds },
                include: [testList, Brigade],
            })
            return res.json(items)
        }

        // RW: see only their brigade's items
        if (req.scope.brigadeId) {
            const items = await TestItem.findAll({
                where: { brigadeId: req.scope.brigadeId },
                include: [testList, Brigade],
            })
            return res.json(items)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// GET /api/test-items/upcoming — scoped by role, nextTestDate <= today + 10 days
export const getUpcoming = async (req, res, next) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const inTenDays = new Date(today)
        inTenDays.setDate(inTenDays.getDate() + 10)
        inTenDays.setHours(23, 59, 59, 999)

        const dateFilter = {
            nextTestDate: {
                [Op.between]: [today, inTenDays]
            },
            testListId: {
                [Op.not]: null
            }
        }

        // GOD: see all upcoming
        if (!req.scope) {
            const items = await TestItem.findAll({
                where: dateFilter,
                include: [testList, Brigade],
                order: [['nextTestDate', 'ASC']]
            })
            return res.json(items)
        }

        // SEMI-GOD: items in their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id'],
            })
            const brigadeIds = brigades.map((b) => b.id)

            const items = await TestItem.findAll({
                where: { ...dateFilter, brigadeId: brigadeIds },
                include: [testList, Brigade],
                order: [['nextTestDate', 'ASC']]
            })
            return res.json(items)
        }

        // RW: only their brigade's
        if (req.scope.brigadeId) {
            const items = await TestItem.findAll({
                where: { ...dateFilter, brigadeId: req.scope.brigadeId },
                include: [testList, Brigade],
                order: [['nextTestDate', 'ASC']]
            })
            return res.json(items)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// GET /api/test-items/wasted — scoped by role, nextTestDate < today
export const getWasted = async (req, res, next) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const dateFilter = {
            nextTestDate: {
                [Op.lt]: today
            },
            testListId: {
                [Op.not]: null
            }
        }

        // GOD: see all wasted
        if (!req.scope) {
            const items = await TestItem.findAll({
                where: dateFilter,
                include: [testList, Brigade],
                order: [['nextTestDate', 'ASC']]
            })
            return res.json(items)
        }

        // SEMI-GOD: items in their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id'],
            })
            const brigadeIds = brigades.map((b) => b.id)

            const items = await TestItem.findAll({
                where: { ...dateFilter, brigadeId: brigadeIds },
                include: [testList, Brigade],
                order: [['nextTestDate', 'ASC']]
            })
            return res.json(items)
        }

        // RW: only their brigade's
        if (req.scope.brigadeId) {
            const items = await TestItem.findAll({
                where: { ...dateFilter, brigadeId: req.scope.brigadeId },
                include: [testList, Brigade],
                order: [['nextTestDate', 'ASC']]
            })
            return res.json(items)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// GET /api/test-items/:id — scoped by role
export const getById = async (req, res, next) => {
    try {
        const item = await TestItem.findByPk(req.params.id, { include: [testList, Brigade] })
        if (!item) return res.status(404).json({ error: 'Test item not found' })

        // GOD: see any
        if (!req.scope) return res.json(item)

        // SEMI-GOD: only if in their detachment
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            const brigade = await Brigade.findByPk(item.brigadeId)
            if (!brigade || brigade.detachmentId !== req.scope.detachmentId) {
                return res.status(403).json({ error: 'Forbidden: not in your detachment' })
            }
            return res.json(item)
        }

        // RW: only their brigade
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

// GET /api/test-items/brigade/:brigadeId — grouped by testList
export const getByBrigade = async (req, res, next) => {
    try {
        const lists = await testList.findAll({
            include: {
                model: TestItem,
                where: { brigadeId: req.params.brigadeId },
                required: false,
            },
            order: [['id', 'ASC']]
        })
        res.json(lists)
    } catch (err) {
        next(err)
    }
}

// GET /api/test-items/brigade/:brigadeId/test-list/:testListId — items for a brigade+list combo
export const getByBrigadeAndList = async (req, res, next) => {
    try {
        const items = await TestItem.findAll({
            where: {
                brigadeId: req.params.brigadeId,
                testListId: req.params.testListId,
            },
            include: [testList, Brigade],
        })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

// POST /api/test-items — body must include { name, testListId, brigadeId }
export const create = async (req, res, next) => {
    try {
        // GOD: can create for any brigade+list
        if (!req.scope) {
            const item = await TestItem.create(req.body)
            return res.status(201).json(item)
        }

        // SEMI-GOD: read-only
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        // RW: can create only for their brigade
        if (req.scope.brigadeId) {
            const item = await TestItem.create({
                ...req.body,
                brigadeId: req.scope.brigadeId, // force own brigade
            })
            return res.status(201).json(item)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// PUT /api/test-items/:id
export const update = async (req, res, next) => {
    try {
        const item = await TestItem.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Test item not found' })

        // GOD: can update any
        if (!req.scope) {
            await item.update(req.body)
            return res.json(item)
        }

        // SEMI-GOD: read-only
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        // RW: can update only their brigade's items (all fields)
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

// DELETE /api/test-items/:id
export const remove = async (req, res, next) => {
    try {
        const item = await TestItem.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Test item not found' })

        // GOD: can delete any
        if (!req.scope) {
            await item.destroy()
            return res.json({ message: 'Test item deleted' })
        }

        // SEMI-GOD: read-only
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        // RW: can delete only their brigade's items
        if (req.scope.brigadeId) {
            if (item.brigadeId !== req.scope.brigadeId) {
                return res.status(403).json({ error: 'Forbidden: not your brigade' })
            }
            await item.destroy()
            return res.json({ message: 'Test item deleted' })
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}

// PUT /api/test-items/transfer — move one or many items to another brigade
export const transfer = async (req, res, next) => {
    try {
        const { itemIds, toBrigadeId } = req.body

        if (!toBrigadeId) {
            return res.status(400).json({ error: 'toBrigadeId is required' })
        }
        if (!itemIds || (Array.isArray(itemIds) && itemIds.length === 0)) {
            return res.status(400).json({ error: 'itemIds is required (number or array of numbers)' })
        }

        // Normalize to array
        const ids = Array.isArray(itemIds) ? itemIds : [itemIds]

        // Verify target brigade exists
        const targetBrigade = await Brigade.findByPk(toBrigadeId)
        if (!targetBrigade) {
            return res.status(404).json({ error: 'Target brigade not found' })
        }

        // Find all items
        const items = await TestItem.findAll({ where: { id: ids } })
        if (items.length === 0) {
            return res.status(404).json({ error: 'No test items found' })
        }

        // Transfer all: update brigadeId, keep same testListId
        await TestItem.update({ brigadeId: toBrigadeId }, { where: { id: ids } })

        // Return updated items
        const updated = await TestItem.findAll({
            where: { id: ids },
            include: [testList, Brigade],
        })

        res.json(updated)
    } catch (err) {
        next(err)
    }
}

// PUT /api/test-items/bulk-update — update multiple items with the same data
export const bulkUpdate = async (req, res, next) => {
    try {
        const { itemIds, data } = req.body

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ error: 'itemIds is required (array of numbers)' })
        }
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'data object is required' })
        }

        // Only allow specific fields to be updated
        const allowedFields = ['testDate', 'result', 'nextTestDate', 'linkName', 'link']
        const updatePayload = {}
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updatePayload[field] = data[field]
            }
        }

        if (Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' })
        }

        // GOD: can update any
        if (!req.scope) {
            await TestItem.update(updatePayload, { where: { id: itemIds } })
            const updated = await TestItem.findAll({ where: { id: itemIds }, include: [testList, Brigade] })
            return res.json(updated)
        }

        // SEMI-GOD: read-only
        if (req.scope.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }

        // RW: can update only their brigade's items
        if (req.scope.brigadeId) {
            const items = await TestItem.findAll({ where: { id: itemIds } })
            const allOwned = items.every(item => item.brigadeId === req.scope.brigadeId)
            if (!allOwned) {
                return res.status(403).json({ error: 'Forbidden: some items do not belong to your brigade' })
            }

            await TestItem.update(updatePayload, { where: { id: itemIds } })
            const updated = await TestItem.findAll({ where: { id: itemIds }, include: [testList, Brigade] })
            return res.json(updated)
        }

        return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    } catch (err) {
        next(err)
    }
}
