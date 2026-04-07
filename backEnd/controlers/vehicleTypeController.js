import { VehicleType, Brigade, EquipmentItem } from '../models/index.js'

// GET /api/vehicle-types?brigadeId=
export const getAll = async (req, res, next) => {
    try {
        const { brigadeId } = req.query
        const where = {}
        if (brigadeId) where.brigadeId = brigadeId

        const types = await VehicleType.findAll({
            where,
            include: [{ model: Brigade, attributes: ['name'] }],
            order: [['id', 'ASC']],
        })
        res.json(types)
    } catch (err) {
        next(err)
    }
}

// POST /api/vehicle-types (GOD only)
export const create = async (req, res, next) => {
    try {
        const { name, viechle_count, brigadeId } = req.body
        if (!name || !brigadeId) {
            return res.status(400).json({ error: 'name and brigadeId are required' })
        }
        const type = await VehicleType.create({
            name,
            viechle_count: viechle_count || 0,
            brigadeId,
        })
        res.status(201).json(type)
    } catch (err) {
        next(err)
    }
}

// PUT /api/vehicle-types/:id (GOD, RW)
export const update = async (req, res, next) => {
    try {
        const { id } = req.params
        const type = await VehicleType.findByPk(id)
        if (!type) return res.status(404).json({ error: 'VehicleType not found' })

        // RW can only update own brigade's vehicle type
        if (req.user && req.user.role === 'RW' && req.user.brigadeId !== type.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: can only manage own brigade' })
        }

        const { name, viechle_count } = req.body
        await type.update({
            ...(name !== undefined && { name }),
            ...(viechle_count !== undefined && { viechle_count }),
        })
        res.json(type)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/vehicle-types/:id (GOD only)
export const remove = async (req, res, next) => {
    try {
        const { id } = req.params
        const type = await VehicleType.findByPk(id)
        if (!type) return res.status(404).json({ error: 'VehicleType not found' })
        await type.destroy()
        res.json({ message: 'Deleted' })
    } catch (err) {
        next(err)
    }
}
