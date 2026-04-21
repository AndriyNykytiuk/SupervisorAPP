import { VehicleType, Brigade, BrigadeVehicle, EquipmentItem } from '../models/index.js'

// GET /api/vehicle-types?brigadeId=
export const getAll = async (req, res, next) => {
    try {
        const { brigadeId } = req.query
        const types = await VehicleType.findAll({
            include: [
                { 
                    model: BrigadeVehicle, 
                    where: brigadeId ? { brigadeId } : {}, 
                    required: false 
                }
            ],
            order: [['id', 'ASC']],
        })

        const mapped = types.map(t => {
            const json = t.toJSON()
            json.viechle_count = json.BrigadeVehicles?.[0]?.count || 0
            delete json.BrigadeVehicles
            return json
        })
        res.json(mapped)
    } catch (err) {
        next(err)
    }
}

// POST /api/vehicle-types (GOD only)
// body: { name, cloneFromId? } — if cloneFromId is provided, equipment items from that type are copied with zeroed quantities
export const create = async (req, res, next) => {
    const sequelize = VehicleType.sequelize
    const t = await sequelize.transaction()
    try {
        const { name, cloneFromId } = req.body
        if (!name) {
            await t.rollback()
            return res.status(400).json({ error: 'name is required' })
        }

        const type = await VehicleType.create({ name }, { transaction: t })

        let clonedCount = 0
        if (cloneFromId) {
            const source = await VehicleType.findByPk(cloneFromId, { transaction: t })
            if (!source) {
                await t.rollback()
                return res.status(400).json({ error: 'cloneFromId not found' })
            }
            const sourceItems = await EquipmentItem.findAll({
                where: { vehicleTypeId: cloneFromId },
                transaction: t,
            })
            if (sourceItems.length > 0) {
                const clones = sourceItems.map((it) => ({
                    name: it.name,
                    required_per_vehicle: 0,
                    required_rule: it.required_rule || 'exact',
                    warehouse_required: 0,
                    warehouse_rule: it.warehouse_rule || 'exact',
                    warehouse_percent: null,
                    vehicleTypeId: type.id,
                }))
                await EquipmentItem.bulkCreate(clones, { transaction: t })
                clonedCount = clones.length
            }
        }

        await t.commit()
        res.status(201).json({ ...type.toJSON(), clonedCount })
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

// PUT /api/vehicle-types/:id (GOD, RW)
export const update = async (req, res, next) => {
    try {
        const { id } = req.params
        const type = await VehicleType.findByPk(id)
        if (!type) return res.status(404).json({ error: 'VehicleType not found' })

        // RW or GOD can pass `brigadeId` to update specific brigade's vehicle count
        const targetBrigadeId = req.user?.role === 'RW' ? req.user.brigadeId : req.body.brigadeId

        const { name, viechle_count } = req.body
        
        // Only GOD can update the global name
        if (name !== undefined && (!req.user || req.user.role === 'GOD')) {
            await type.update({ name })
        }

        // Update brigade vehicle count if provided
        if (viechle_count !== undefined && targetBrigadeId) {
            const [bv] = await BrigadeVehicle.findOrCreate({ 
                where: { vehicleTypeId: id, brigadeId: targetBrigadeId },
                defaults: { count: 0 }
            })
            await bv.update({ count: viechle_count })
        }
        
        // Return OK, real data is re-fetched by frontend
        res.json({ message: 'Success' })
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
