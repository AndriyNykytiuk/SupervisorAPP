import { EquipmentItem, VehicleType, EquipmentAvailability } from '../models/index.js'

    // GET /api/equipment-items?vehicleTypeId=
    export const getAll = async (req, res, next) => {
        try {
            const { vehicleTypeId, brigadeId } = req.query
        const where = {}
        if (vehicleTypeId) where.vehicleTypeId = vehicleTypeId

        const include = [{ model: VehicleType, attributes: ['name'] }]
        if (brigadeId) {
            include.push({ 
                model: EquipmentAvailability, 
                where: { brigadeId }, 
                required: false 
            })
        }

        const items = await EquipmentItem.findAll({
            where,
            include,
            order: [['id', 'ASC']],
        })

        const mapped = items.map(t => {
            const json = t.toJSON()
            const av = json.EquipmentAvailabilities?.[0]
            json.actual_count = av?.available || 0
            json.warehouse_actual = av?.reserveAvailable || 0
            json.total_need = av?.total_need || 0
            delete json.EquipmentAvailabilities
            return json
        })
        res.json(mapped)
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

    // PUT /api/equipment-items/:id (GOD, RW)
    export const update = async (req, res, next) => {
        try {
            const { id } = req.params
        const item = await EquipmentItem.findByPk(id)
        if (!item) return res.status(404).json({ error: 'EquipmentItem not found' })

        const targetBrigadeId = req.user?.role === 'RW' ? req.user.brigadeId : req.body.brigadeId
        const { actual_count, warehouse_actual, total_need, ...globalData } = req.body

        // RW role can only update actual/warehouse bounds for their own brigade
        // GOD role can update the global template details (globalData)
        if (!req.user || req.user.role === 'GOD') {
            await item.update(globalData)
        }

        if (targetBrigadeId && (actual_count !== undefined || warehouse_actual !== undefined || total_need !== undefined)) {
            const [ea] = await EquipmentAvailability.findOrCreate({ 
                where: { equipmentItemId: id, brigadeId: targetBrigadeId },
                defaults: { available: 0, reserveAvailable: 0, total_need: 0 }
            })
            const updates = {}
            if (actual_count !== undefined) updates.available = actual_count
            if (warehouse_actual !== undefined) updates.reserveAvailable = warehouse_actual
            if (total_need !== undefined) updates.total_need = total_need
            await ea.update(updates)
        }

        res.json({ message: 'Success' })
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
