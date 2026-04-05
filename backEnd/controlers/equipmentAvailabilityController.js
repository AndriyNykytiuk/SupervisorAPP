import { EquipmentAvailability, EquipmentItem, VehicleType, Brigade, Detachment } from '../models/index.js'

// GET /api/equipment-availability?brigadeId=&vehicleTypeId=
export const getAll = async (req, res, next) => {
    try {
        const { brigadeId, vehicleTypeId } = req.query
        const where = {}
        if (brigadeId) where.brigadeId = brigadeId

        // If vehicleTypeId filter is provided, we need to filter through EquipmentItem
        const itemWhere = {}
        if (vehicleTypeId) itemWhere.vehicleTypeId = vehicleTypeId

        // Apply scope
        if (req.scope?.brigadeId) {
            where.brigadeId = req.scope.brigadeId
        } else if (req.scope?.detachmentId) {
            // For SEMI-GOD — filter brigades by detachment
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id'],
            })
            where.brigadeId = brigades.map(b => b.id)
        }

        // Build the Include object separately to avoid passing where: undefined
        const equipmentItemInclude = {
            model: EquipmentItem,
            include: [{ model: VehicleType, attributes: ['name'] }],
        }
        if (Object.keys(itemWhere).length > 0) {
            equipmentItemInclude.where = itemWhere
        }

        const rows = await EquipmentAvailability.findAll({
            where,
            include: [
                equipmentItemInclude,
                {
                    model: Brigade,
                    attributes: ['id', 'name'],
                    include: [{ model: Detachment, attributes: ['name'] }],
                },
            ],
            // Revert to simple order by since Sequelize handles main model id automatically
            order: [['id', 'ASC']],
        })
        res.json(rows)
    } catch (err) {
        console.error('SERVER DB ERROR:', err)
        next(err)
    }
}

// POST /api/equipment-availability (RW own brigade, GOD all)
export const create = async (req, res, next) => {
    try {
        const { equipmentItemId, brigadeId, vehicleCount, available, reserveAvailable } = req.body

        if (!equipmentItemId || !brigadeId) {
            return res.status(400).json({ error: 'equipmentItemId and brigadeId are required' })
        }

        // RW can only create for own brigade
        if (req.user.role === 'RW' && req.user.brigadeId !== brigadeId) {
            return res.status(403).json({ error: 'Forbidden: can only manage own brigade' })
        }

        const row = await EquipmentAvailability.create({
            equipmentItemId,
            brigadeId,
            vehicleCount: vehicleCount || 0,
            available: available || 0,
            reserveAvailable: reserveAvailable || 0,
        })
        res.status(201).json(row)
    } catch (err) {
        next(err)
    }
}

// PUT /api/equipment-availability/:id (RW own brigade, GOD all)
export const update = async (req, res, next) => {
    try {
        const { id } = req.params
        const row = await EquipmentAvailability.findByPk(id)
        if (!row) return res.status(404).json({ error: 'EquipmentAvailability not found' })

        // RW can only update own brigade
        if (req.user.role === 'RW' && req.user.brigadeId !== row.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: can only manage own brigade' })
        }

        const { vehicleCount, available, reserveAvailable } = req.body
        await row.update({
            ...(vehicleCount !== undefined && { vehicleCount }),
            ...(available !== undefined && { available }),
            ...(reserveAvailable !== undefined && { reserveAvailable }),
        })
        res.json(row)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/equipment-availability/:id (GOD only)
export const remove = async (req, res, next) => {
    try {
        const { id } = req.params
        const row = await EquipmentAvailability.findByPk(id)
        if (!row) return res.status(404).json({ error: 'EquipmentAvailability not found' })
        await row.destroy()
        res.json({ message: 'Deleted' })
    } catch (err) {
        next(err)
    }
}
