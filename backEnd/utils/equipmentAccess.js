import {
    TestItem, ToolItem, FireExtenguisher, LightMast, ChainSaw, PneumaticTool,
    PetrolCutter, ElectricStations, WaterPumps, HydravlicTool, SwimTools,
    backPackExtenguisher, SpecialTool, FireHydrant, FireHose, Brigade, User,
} from '../models/index.js'

// Map equipmentType (sent from frontend) to its Sequelize model.
// Models must have brigadeId column. Strip "Archive" suffix to lookup base type.
const MODEL_MAP = {
    TestItem,
    ToolItem,
    FireExtenguisher,
    LightMast,
    ChainSaw,
    PneumaticTool,
    PetrolCutter,
    ElectricStations,
    WaterPumps,
    HydravlicTool,
    SwimTools,
    backPackExtenguisher,
    SpecialTool,
    FireHydrant,
    FireHose,
}

// "Virtual" types where equipmentId IS the brigadeId itself (1 doc per brigade).
const VIRTUAL_BRIGADE_TYPES = new Set([
    'ExtenguisProtocol',
    'TestSchedule',
    'TestOrder',
])

/**
 * Resolve the brigadeId that owns a given equipment item.
 * Returns null if the equipment doesn't exist.
 * Throws if the equipmentType is unknown.
 */
export async function resolveEquipmentBrigadeId(equipmentType, equipmentId) {
    if (VIRTUAL_BRIGADE_TYPES.has(equipmentType)) {
        // For virtual types, equipmentId == brigadeId. Verify brigade exists.
        const brigade = await Brigade.findByPk(equipmentId)
        return brigade ? brigade.id : null
    }

    const baseType = equipmentType.replace(/Archive$/, '')
    const Model = MODEL_MAP[baseType]
    if (!Model) {
        const err = new Error(`Unknown equipmentType: ${equipmentType}`)
        err.status = 400
        throw err
    }

    const item = await Model.findByPk(equipmentId)
    return item ? item.brigadeId : null
}

/**
 * Check if the requesting user has access to a brigade.
 * GOD: yes for any. SEMI-GOD: yes if brigade is in their detachment.
 * RW: yes only if it's their brigade.
 * Returns true/false.
 */
export async function userHasBrigadeAccess(user, brigadeId) {
    if (!user) return false
    if (user.role === 'GOD') return true

    const fullUser = await User.findByPk(user.id, {
        include: { model: Brigade, attributes: ['id', 'detachmentId'] },
    })
    if (!fullUser) return false

    if (user.role === 'SEMI-GOD') {
        const userDetachmentId = fullUser.detachmentId ?? fullUser.Brigade?.detachmentId
        if (!userDetachmentId) return false
        const brigade = await Brigade.findByPk(brigadeId)
        return brigade?.detachmentId === userDetachmentId
    }

    // RW
    return fullUser.Brigade?.id === brigadeId
}
