import { EquipmentItem, VehicleType } from '../models/index.js'

// GET /api/equipment-items?vehicleTypeId=
export const getAll = async (req, res, next) => {
    try {
        const { vehicleTypeId } = req.query
        const where = {}
        if (vehicleTypeId) where.vehicleTypeId = vehicleTypeId

        const items = await EquipmentItem.findAll({
            where,
            include: [{ model: VehicleType, attributes: ['name'] }],
            order: [['id', 'ASC']],
        })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

// POST /api/equipment-items (GOD only)
export const create = async (req, res, next) => {
    try {
        const { name, norm, brigadeNorm, vehicleTypeId } = req.body
        if (!name || !vehicleTypeId) {
            return res.status(400).json({ error: 'name and vehicleTypeId are required' })
        }
        const item = await EquipmentItem.create({
            name,
            norm: norm || 0,
            brigadeNorm: brigadeNorm || 0,
            vehicleTypeId,
        })
        res.status(201).json(item)
    } catch (err) {
        next(err)
    }
}

// PUT /api/equipment-items/:id (GOD only)
export const update = async (req, res, next) => {
    try {
        const { id } = req.params
        const item = await EquipmentItem.findByPk(id)
        if (!item) return res.status(404).json({ error: 'EquipmentItem not found' })

        const { name, norm, brigadeNorm } = req.body
        await item.update({
            ...(name !== undefined && { name }),
            ...(norm !== undefined && { norm }),
            ...(brigadeNorm !== undefined && { brigadeNorm }),
        })
        res.json(item)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/equipment-items/:id (GOD only)
export const remove = async (req, res, next) => {
    try {
        const { id } = req.params
        const item = await EquipmentItem.findByPk(id)
        if (!item) return res.status(404).json({ error: 'EquipmentItem not found' })
        await item.destroy()
        res.json({ message: 'Deleted' })
    } catch (err) {
        next(err)
    }
}
