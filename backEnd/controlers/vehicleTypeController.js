import { VehicleType } from '../models/index.js'

// GET /api/vehicle-types
export const getAll = async (req, res, next) => {
    try {
        const types = await VehicleType.findAll({ order: [['id', 'ASC']] })
        res.json(types)
    } catch (err) {
        next(err)
    }
}

// POST /api/vehicle-types (GOD only)
export const create = async (req, res, next) => {
    try {
        const { name } = req.body
        if (!name) return res.status(400).json({ error: 'Name is required' })
        const type = await VehicleType.create({ name })
        res.status(201).json(type)
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
