import { Vehicle, VehicleInventoryItem, VehicleType, EquipmentItem, Brigade } from '../models/index.js'
import { buildScopedWhere, isSemiGodReadOnly, checkBrigadeAccess } from '../utils/scopeHelpers.js'

const inventoryOrder = [['sortOrder', 'ASC'], ['id', 'ASC']]

// Спільна перевірка: чи існує авто і чи має користувач до нього доступ.
// mode 'read' — GOD/SEMI-GOD/RW у межах свого скоупу; 'write' — SEMI-GOD відсікається.
async function loadVehicle(req, res, mode = 'read') {
    const vehicle = await Vehicle.findByPk(req.params.vehicleId || req.params.id)
    if (!vehicle) {
        res.status(404).json({ error: 'Автомобіль не знайдено' })
        return null
    }
    if (mode === 'write' && isSemiGodReadOnly(req.scope, res)) return null
    const ok = await checkBrigadeAccess(req.scope, vehicle.brigadeId, res)
    if (!ok) return null
    if (mode === 'write' && req.user.role === 'RW' && vehicle.brigadeId !== req.user.brigadeId) {
        res.status(403).json({ error: 'Forbidden' })
        return null
    }
    return vehicle
}

// Створює позиції опису з нормативу типу авто (EquipmentItem), пропускаючи ті,
// що вже прив'язані. Повертає кількість доданих рядків.
async function fillFromStandard(vehicle, { transaction } = {}) {
    if (!vehicle.vehicleTypeId) return 0

    const standard = await EquipmentItem.findAll({
        where: { vehicleTypeId: vehicle.vehicleTypeId },
        order: [['id', 'ASC']],
        transaction,
    })
    if (standard.length === 0) return 0

    const existing = await VehicleInventoryItem.findAll({
        where: { vehicleId: vehicle.id },
        attributes: ['equipmentItemId', 'sortOrder'],
        transaction,
    })
    const linked = new Set(existing.map(e => e.equipmentItemId).filter(Boolean))
    const maxOrder = existing.reduce((m, e) => Math.max(m, e.sortOrder || 0), 0)

    const missing = standard.filter(s => !linked.has(s.id))
    if (missing.length === 0) return 0

    await VehicleInventoryItem.bulkCreate(missing.map((s, i) => ({
        name: s.name,
        unit: s.unit || 'шт.',
        // Норма фіксується текстом на момент створення — щоб опис друкувався
        // так само, навіть якщо GOD згодом підправить норматив.
        requiredText: s.required_text || (s.required_rule === 'tu' ? 'Відповідно до ТУ' : String(s.required_per_vehicle ?? 0)),
        actualQuantity: 0,
        sortOrder: maxOrder + i + 1,
        equipmentItemId: s.id,
        vehicleId: vehicle.id,
    })), { transaction })

    return missing.length
}

// GET /api/vehicles?brigadeId=&vehicleTypeId=
export const getAll = async (req, res, next) => {
    try {
        const where = await buildScopedWhere(req.scope)
        const { brigadeId, vehicleTypeId } = req.query

        // GOD не має скоупу — фільтр з UI застосовується напряму.
        // Для RW/SEMI-GOD скоуп уже звузив вибірку, тому brigadeId лише уточнює її.
        if (brigadeId) {
            if (!where.brigadeId) where.brigadeId = Number(brigadeId)
            else if (Array.isArray(where.brigadeId)) {
                where.brigadeId = where.brigadeId.includes(Number(brigadeId)) ? Number(brigadeId) : where.brigadeId
            }
        }
        if (vehicleTypeId) where.vehicleTypeId = Number(vehicleTypeId)

        const vehicles = await Vehicle.findAll({
            where,
            include: [
                { model: VehicleType, attributes: ['id', 'name'] },
                { model: Brigade, attributes: ['id', 'name'] },
                { model: VehicleInventoryItem, attributes: ['id'] },
            ],
            order: [['id', 'ASC']],
        })

        const mapped = vehicles.map(v => {
            const json = v.toJSON()
            json.itemsCount = json.VehicleInventoryItems?.length || 0
            delete json.VehicleInventoryItems
            return json
        })
        res.json(mapped)
    } catch (err) {
        next(err)
    }
}

// GET /api/vehicles/:id — картка разом з описом майна
export const getById = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'read')
        if (!vehicle) return
        const full = await Vehicle.findByPk(vehicle.id, {
            include: [
                { model: VehicleType, attributes: ['id', 'name'] },
                { model: Brigade, attributes: ['id', 'name'] },
                { model: VehicleInventoryItem, separate: true, order: inventoryOrder },
            ],
        })
        res.json(full)
    } catch (err) {
        next(err)
    }
}

// POST /api/vehicles
// body: { brand, stateNumber?, yearOfManufacture?, status?, notes?, vehicleTypeId?, brigadeId?, cloneFromVehicleId? }
export const create = async (req, res, next) => {
    const sequelize = Vehicle.sequelize
    const t = await sequelize.transaction()
    try {
        if (isSemiGodReadOnly(req.scope, res)) {
            await t.rollback()
            return
        }
        const { brand, cloneFromVehicleId } = req.body
        if (!brand || !String(brand).trim()) {
            await t.rollback()
            return res.status(400).json({ error: 'Вкажіть марку автомобіля' })
        }

        const brigadeId = req.user.role === 'RW' ? req.user.brigadeId : req.body.brigadeId
        if (!brigadeId) {
            await t.rollback()
            return res.status(400).json({ error: 'brigadeId is required' })
        }

        const vehicle = await Vehicle.create({
            brand: String(brand).trim(),
            stateNumber: req.body.stateNumber || null,
            yearOfManufacture: req.body.yearOfManufacture || null,
            status: req.body.status || 'combat',
            notes: req.body.notes || null,
            vehicleTypeId: req.body.vehicleTypeId || null,
            brigadeId,
        }, { transaction: t })

        // Клонування опису з іншого авто — типова техніка описується один раз.
        let clonedCount = 0
        if (cloneFromVehicleId) {
            const source = await Vehicle.findByPk(cloneFromVehicleId, { transaction: t })
            if (!source) {
                await t.rollback()
                return res.status(400).json({ error: 'Автомобіль-джерело не знайдено' })
            }
            const ok = await checkBrigadeAccess(req.scope, source.brigadeId, res)
            if (!ok) {
                await t.rollback()
                return
            }
            const sourceItems = await VehicleInventoryItem.findAll({
                where: { vehicleId: source.id },
                order: inventoryOrder,
                transaction: t,
            })
            if (sourceItems.length > 0) {
                await VehicleInventoryItem.bulkCreate(sourceItems.map(it => ({
                    name: it.name,
                    unit: it.unit,
                    requiredText: it.requiredText,
                    actualQuantity: it.actualQuantity,
                    sortOrder: it.sortOrder,
                    equipmentItemId: it.equipmentItemId,
                    vehicleId: vehicle.id,
                })), { transaction: t })
                clonedCount = sourceItems.length
            }
        } else if (vehicle.vehicleTypeId) {
            // Опис підтягується з нормативу типу: RW обирає лише тип авто.
            clonedCount = await fillFromStandard(vehicle, { transaction: t })
        }

        await t.commit()
        res.status(201).json({ ...vehicle.toJSON(), clonedCount })
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

// PUT /api/vehicles/:id
export const update = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'write')
        if (!vehicle) return
        const { id, brigadeId, VehicleInventoryItems, ...allowed } = req.body
        await vehicle.update(allowed)
        res.json(vehicle)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/vehicles/:id
export const remove = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'write')
        if (!vehicle) return
        await vehicle.destroy()
        res.json({ message: 'Deleted' })
    } catch (err) {
        next(err)
    }
}

// ── Опис майна ───────────────────────────────────────

// GET /api/vehicles/:vehicleId/items
export const getItems = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'read')
        if (!vehicle) return
        const items = await VehicleInventoryItem.findAll({
            where: { vehicleId: vehicle.id },
            order: inventoryOrder,
        })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

// POST /api/vehicles/:vehicleId/items
// body: { name, unit?, requiredText?, actualQuantity? } або { items: [...] }
export const createItem = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'write')
        if (!vehicle) return

        const rows = Array.isArray(req.body?.items) ? req.body.items : [req.body]
        if (rows.length === 0) return res.status(400).json({ error: 'Порожній список' })
        if (rows.length > 500) return res.status(400).json({ error: 'Максимум 500 позицій за раз' })
        if (rows.some(r => !r?.name || !String(r.name).trim())) {
            return res.status(400).json({ error: 'Кожна позиція потребує найменування' })
        }

        const last = await VehicleInventoryItem.max('sortOrder', { where: { vehicleId: vehicle.id } })
        let nextOrder = (Number.isFinite(last) ? last : 0) + 1

        const created = await VehicleInventoryItem.bulkCreate(rows.map(r => ({
            name: String(r.name).trim(),
            unit: r.unit || 'шт.',
            requiredText: r.requiredText ?? null,
            actualQuantity: Number(r.actualQuantity) || 0,
            sortOrder: r.sortOrder ?? nextOrder++,
            vehicleId: vehicle.id,
        })), { returning: true })

        res.status(201).json(Array.isArray(req.body?.items) ? created : created[0])
    } catch (err) {
        next(err)
    }
}

// POST /api/vehicles/:vehicleId/items/sync-standard
// Підтягнути норматив типу: додає позиції, яких ще немає. Введені кількості не чіпає.
export const syncStandard = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'write')
        if (!vehicle) return
        if (!vehicle.vehicleTypeId) {
            return res.status(400).json({ error: 'Для авто не обрано тип техніки' })
        }
        const added = await fillFromStandard(vehicle)
        const items = await VehicleInventoryItem.findAll({
            where: { vehicleId: vehicle.id },
            order: inventoryOrder,
        })
        res.json({ added, items })
    } catch (err) {
        next(err)
    }
}

// PUT /api/vehicles/:vehicleId/items/:itemId
export const updateItem = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'write')
        if (!vehicle) return
        const item = await VehicleInventoryItem.findByPk(req.params.itemId)
        if (!item || item.vehicleId !== vehicle.id) {
            return res.status(404).json({ error: 'Позицію не знайдено' })
        }
        const { id, vehicleId, ...allowed } = req.body
        await item.update(allowed)
        res.json(item)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/vehicles/:vehicleId/items/:itemId
export const removeItem = async (req, res, next) => {
    try {
        const vehicle = await loadVehicle(req, res, 'write')
        if (!vehicle) return
        const item = await VehicleInventoryItem.findByPk(req.params.itemId)
        if (!item || item.vehicleId !== vehicle.id) {
            return res.status(404).json({ error: 'Позицію не знайдено' })
        }
        await item.destroy()
        res.json({ message: 'Deleted' })
    } catch (err) {
        next(err)
    }
}
