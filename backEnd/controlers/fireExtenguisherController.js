import { Op } from 'sequelize'
import { FireExtenguisher, Brigade } from '../models/index.js'
import { createBrigadeScopedController, buildScopedWhere } from '../utils/scopeHelpers.js'

export const { getAll, getById, getByBrigade, create, update, remove } = createBrigadeScopedController(FireExtenguisher)

// GET /api/fire-extenguishers/upcoming — items with nextMaintenanceDate within today..+10 days
export const getUpcoming = async (req, res, next) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const inTenDays = new Date(today)
        inTenDays.setDate(inTenDays.getDate() + 10)
        inTenDays.setHours(23, 59, 59, 999)

        const dateFilter = {
            nextMaintenanceDate: { [Op.between]: [today, inTenDays] },
        }

        const scopedWhere = await buildScopedWhere(req.scope)
        const items = await FireExtenguisher.findAll({
            where: { ...scopedWhere, ...dateFilter },
            include: [Brigade],
            order: [['nextMaintenanceDate', 'ASC']],
        })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

// GET /api/fire-extenguishers/wasted — items with nextMaintenanceDate < today
export const getWasted = async (req, res, next) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const dateFilter = {
            nextMaintenanceDate: { [Op.lt]: today },
        }

        const scopedWhere = await buildScopedWhere(req.scope)
        const items = await FireExtenguisher.findAll({
            where: { ...scopedWhere, ...dateFilter },
            include: [Brigade],
            order: [['nextMaintenanceDate', 'ASC']],
        })
        res.json(items)
    } catch (err) {
        next(err)
    }
}
