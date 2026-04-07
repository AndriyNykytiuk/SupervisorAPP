import { EquipmentItem, VehicleType } from '../models/index.js'

// GET /api/equipment-items?vehicleTypeId=
export const getAll = async (req, res, next) => {
    try {
        const { vehicleTypeId } = req.query
        const where = {}
        if (vehicleTypeId) where.vehicleTypeId = vehicleTypeId

        const items = await EquipmentItem.findAll({
            where,
            include: [{ model: VehicleType, attributes: ['name', 'viechle_count'] }],
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
        const {
            name,
            required_per_vehicle,
            required_rule,
            warehouse_required,
            warehouse_rule,
            warehouse_percent,
            vehicleTypeId,
        } = req.body
        if (!name || !vehicleTypeId) {
            return res.status(400).json({ error: 'name and vehicleTypeId are required' })
        }
        const item = await EquipmentItem.create({
            name,
            required_per_vehicle: required_per_vehicle || 0,
            required_rule: required_rule || 'exact',
            warehouse_required: warehouse_required || 0,
            warehouse_rule: warehouse_rule || 'exact',
            warehouse_percent: warehouse_percent || null,
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

        const {
            name,
            required_per_vehicle,
            required_rule,
            actual_count,
            warehouse_required,
            warehouse_rule,
            warehouse_percent,
            warehouse_actual,
        } = req.body
        await item.update({
            ...(name !== undefined && { name }),
            ...(required_per_vehicle !== undefined && { required_per_vehicle }),
            ...(required_rule !== undefined && { required_rule }),
            ...(actual_count !== undefined && { actual_count }),
            ...(warehouse_required !== undefined && { warehouse_required }),
            ...(warehouse_rule !== undefined && { warehouse_rule }),
            ...(warehouse_percent !== undefined && { warehouse_percent }),
            ...(warehouse_actual !== undefined && { warehouse_actual }),
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
