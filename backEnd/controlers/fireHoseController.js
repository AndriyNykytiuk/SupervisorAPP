import { FireHose } from '../models/index.js'
import { createBrigadeScopedController, isSemiGodReadOnly } from '../utils/scopeHelpers.js'

export const { getAll, getById, getByBrigade, create, update, remove } = createBrigadeScopedController(FireHose)

// PUT /api/fire-hoses/bulk-update — update many hoses with the same payload
export const bulkUpdate = async (req, res, next) => {
    try {
        const { itemIds, data } = req.body

        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ error: 'itemIds is required (array of numbers)' })
        }
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'data object is required' })
        }

        const allowedFields = ['lastTestDate', 'nextTestDate', 'manufactureDate', 'result', 'linkName', 'link', 'notes']
        const payload = {}
        for (const f of allowedFields) {
            if (data[f] !== undefined) payload[f] = data[f]
        }
        if (Object.keys(payload).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' })
        }

        if (isSemiGodReadOnly(req.scope, res)) return

        if (req.scope?.brigadeId) {
            const items = await FireHose.findAll({ where: { id: itemIds } })
            const allOwned = items.every(it => it.brigadeId === req.scope.brigadeId)
            if (!allOwned) {
                return res.status(403).json({ error: 'Forbidden: some items do not belong to your brigade' })
            }
        }

        await FireHose.update(payload, { where: { id: itemIds } })
        const updated = await FireHose.findAll({ where: { id: itemIds } })
        res.json(updated)
    } catch (err) {
        next(err)
    }
}
