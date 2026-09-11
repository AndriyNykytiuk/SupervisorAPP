import { Op } from 'sequelize'
import {
    Vehicle,
    VehicleInventoryItem,
    VehicleType,
    EquipmentItem,
    EquipmentAvailability,
    Brigade,
    Detachment,
} from '../models/index.js'
import { buildScopedWhere } from '../utils/scopeHelpers.js'

// Потреба — похідна величина, у БД не зберігається:
//   норма на парк   = required_per_vehicle × кількість авто цього типу в частині
//   наявність       = сума actualQuantity з описів усіх авто цього типу
//   некомплект      = max(0, норма на парк − наявність)
//   резерв частини  = warehouse_required, або % від норми на парк
//   загальна потреба = некомплект по авто + некомплект по резерву
function calcRow(item, vehicleCount, onVehicles, reserveActual) {
    const perVehicle = item.required_per_vehicle || 0
    const totalRequired = perVehicle * vehicleCount
    const vehicleShortage = Math.max(0, totalRequired - onVehicles)

    let reserveNorm = item.warehouse_required || 0
    if (item.warehouse_rule === 'percent_of_actual' && item.warehouse_percent) {
        reserveNorm = Math.ceil(totalRequired * (item.warehouse_percent / 100))
    }
    const reserveShortage = Math.max(0, reserveNorm - reserveActual)

    return {
        equipmentItemId: item.id,
        name: item.name,
        unit: item.unit || 'шт.',
        vehicleTypeId: item.vehicleTypeId,
        vehicleTypeName: item.VehicleType?.name || null,
        required_rule: item.required_rule || 'exact',
        required_text: item.required_text || null,
        required_per_vehicle: perVehicle,
        vehicleCount,
        totalRequired,
        onVehicles,
        vehicleShortage,
        warehouse_rule: item.warehouse_rule || 'exact',
        warehouse_percent: item.warehouse_percent || null,
        reserveNorm,
        reserveActual,
        reserveShortage,
        totalNeed: vehicleShortage + reserveShortage,
    }
}

// Скільки авто кожного типу має частина — рахуємо по картках авто,
// вручну введені кількості більше не використовуються.
async function countVehiclesByType(brigadeIds, vehicleTypeId) {
    // Авто без типу в розрахунку не беруть участі — норматив прив'язаний до типу
    const where = { brigadeId: brigadeIds, vehicleTypeId: { [Op.ne]: null } }
    if (vehicleTypeId) where.vehicleTypeId = Number(vehicleTypeId)

    const rows = await Vehicle.findAll({
        where,
        attributes: ['id', 'brigadeId', 'vehicleTypeId'],
        raw: true,
    })

    // ключ «brigadeId:vehicleTypeId» → кількість авто
    const counts = new Map()
    const vehicleIdsByBrigade = new Map()
    for (const v of rows) {
        const key = `${v.brigadeId}:${v.vehicleTypeId}`
        counts.set(key, (counts.get(key) || 0) + 1)
        if (!vehicleIdsByBrigade.has(v.brigadeId)) vehicleIdsByBrigade.set(v.brigadeId, [])
        vehicleIdsByBrigade.get(v.brigadeId).push(v.id)
    }
    return { counts, vehicleIdsByBrigade, vehicles: rows }
}

// Наявність по описах: сума actualQuantity у розрізі «частина × позиція нормативу».
async function sumFromDescriptions(vehicles) {
    const ids = vehicles.map(v => v.id)
    if (ids.length === 0) return new Map()

    const items = await VehicleInventoryItem.findAll({
        where: { vehicleId: ids, equipmentItemId: { [Op.ne]: null } },
        attributes: ['vehicleId', 'equipmentItemId', 'actualQuantity'],
        raw: true,
    })

    const brigadeOf = new Map(vehicles.map(v => [v.id, v.brigadeId]))
    const sums = new Map()
    for (const it of items) {
        const key = `${brigadeOf.get(it.vehicleId)}:${it.equipmentItemId}`
        sums.set(key, (sums.get(key) || 0) + (it.actualQuantity || 0))
    }
    return sums
}

// Резерв частини (склад) в описах авто не відображається — це окремий ручний ввід.
async function reserveByBrigade(brigadeIds) {
    const rows = await EquipmentAvailability.findAll({
        where: { brigadeId: brigadeIds },
        attributes: ['brigadeId', 'equipmentItemId', 'reserveAvailable'],
        raw: true,
    })
    const map = new Map()
    for (const r of rows) {
        map.set(`${r.brigadeId}:${r.equipmentItemId}`, r.reserveAvailable || 0)
    }
    return map
}

async function resolveBrigadeIds(req, explicitBrigadeId) {
    const scoped = await buildScopedWhere(req.scope)
    if (scoped.brigadeId) {
        const allowed = Array.isArray(scoped.brigadeId) ? scoped.brigadeId : [scoped.brigadeId]
        if (explicitBrigadeId && allowed.includes(Number(explicitBrigadeId))) return [Number(explicitBrigadeId)]
        return allowed
    }
    // GOD: без скоупу
    if (explicitBrigadeId) return [Number(explicitBrigadeId)]
    const all = await Brigade.findAll({ attributes: ['id'], raw: true })
    return all.map(b => b.id)
}

// GET /api/requirements?brigadeId=&vehicleTypeId=
// Потреба однієї частини — рядок на кожну позицію нормативу обраного типу.
export const getForBrigade = async (req, res, next) => {
    try {
        const { vehicleTypeId } = req.query
        const brigadeIds = await resolveBrigadeIds(req, req.query.brigadeId)
        if (brigadeIds.length === 0) return res.json({ vehicleCount: 0, rows: [] })
        const brigadeId = brigadeIds[0]

        const itemWhere = {}
        if (vehicleTypeId) itemWhere.vehicleTypeId = vehicleTypeId
        const items = await EquipmentItem.findAll({
            where: itemWhere,
            include: [{ model: VehicleType, attributes: ['name'] }],
            order: [['id', 'ASC']],
        })

        const { counts, vehicles } = await countVehiclesByType([brigadeId], vehicleTypeId)
        const sums = await sumFromDescriptions(vehicles)
        const reserves = await reserveByBrigade([brigadeId])

        const rows = items.map(item => calcRow(
            item,
            counts.get(`${brigadeId}:${item.vehicleTypeId}`) || 0,
            sums.get(`${brigadeId}:${item.id}`) || 0,
            reserves.get(`${brigadeId}:${item.id}`) || 0,
        ))

        res.json({
            brigadeId,
            vehicleTypeId: vehicleTypeId ? Number(vehicleTypeId) : null,
            vehicleCount: vehicleTypeId ? (counts.get(`${brigadeId}:${Number(vehicleTypeId)}`) || 0) : vehicles.length,
            rows,
        })
    } catch (err) {
        next(err)
    }
}

// GET /api/requirements/summary?vehicleTypeId=&detachmentId=&groupBy=brigade|detachment
// Зведення: рядки — позиції нормативу, колонки — частини або загони.
export const getSummary = async (req, res, next) => {
    try {
        const { vehicleTypeId, detachmentId, detachmentName } = req.query
        const groupBy = req.query.groupBy === 'detachment' ? 'detachment' : 'brigade'

        const brigadeWhere = {}
        const scoped = await buildScopedWhere(req.scope)
        if (scoped.brigadeId) brigadeWhere.id = scoped.brigadeId
        if (detachmentId) brigadeWhere.detachmentId = Number(detachmentId)
        else if (detachmentName) {
            // UI фільтрує за назвою загону — приймаємо і її
            const det = await Detachment.findOne({ where: { name: detachmentName }, attributes: ['id'] })
            brigadeWhere.detachmentId = det ? det.id : -1
        }

        const brigades = await Brigade.findAll({
            where: brigadeWhere,
            attributes: ['id', 'name', 'detachmentId'],
            include: [{ model: Detachment, attributes: ['id', 'name'] }],
        })
        if (brigades.length === 0) return res.json({ columns: [], rows: [], colTotals: {} })

        const brigadeIds = brigades.map(b => b.id)
        const columnOf = new Map(brigades.map(b => [
            b.id,
            groupBy === 'detachment' ? (b.Detachment?.name || 'Інше') : b.name,
        ]))

        const itemWhere = {}
        if (vehicleTypeId) itemWhere.vehicleTypeId = vehicleTypeId
        const items = await EquipmentItem.findAll({
            where: itemWhere,
            include: [{ model: VehicleType, attributes: ['name'] }],
            order: [['id', 'ASC']],
        })

        const { counts, vehicles } = await countVehiclesByType(brigadeIds, vehicleTypeId)
        const sums = await sumFromDescriptions(vehicles)
        const reserves = await reserveByBrigade(brigadeIds)

        const columns = [...new Set(brigadeIds.map(id => columnOf.get(id)))].sort()
        const colTotals = Object.fromEntries(columns.map(c => [c, 0]))
        colTotals.total = 0

        const rows = items.map(item => {
            const row = {
                id: item.id,
                name: item.name + (vehicleTypeId ? '' : ` (${item.VehicleType?.name || '—'})`),
                unit: item.unit || 'шт.',
                required_per_vehicle: item.required_per_vehicle || 0,
                total: 0,
            }
            columns.forEach(c => { row[c] = 0 })

            for (const b of brigades) {
                const calc = calcRow(
                    item,
                    counts.get(`${b.id}:${item.vehicleTypeId}`) || 0,
                    sums.get(`${b.id}:${item.id}`) || 0,
                    reserves.get(`${b.id}:${item.id}`) || 0,
                )
                const col = columnOf.get(b.id)
                row[col] += calc.totalNeed
                row.total += calc.totalNeed
            }

            columns.forEach(c => { colTotals[c] += row[c] })
            colTotals.total += row.total
            return row
        })

        // Скільки авто стоїть за кожною колонкою — щоб було видно базу розрахунку
        const vehiclesPerColumn = Object.fromEntries(columns.map(c => [c, 0]))
        for (const b of brigades) {
            const col = columnOf.get(b.id)
            for (const [key, n] of counts.entries()) {
                if (key.startsWith(`${b.id}:`)) vehiclesPerColumn[col] += n
            }
        }

        res.json({ columns, rows, colTotals, vehiclesPerColumn, groupBy })
    } catch (err) {
        next(err)
    }
}
