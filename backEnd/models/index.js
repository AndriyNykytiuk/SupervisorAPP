import User from './User.js'
import Detachment from './Detachment.js'
import Brigade from './Brigade.js'
import testList from './testList.js'
import TestItem from './TestItem.js'
import TestLinks from './TestLinksModel.js'
import toolList from './toolList.js'
import ToolItem from './toolItem.js'
import ElectricStations from './ElectricStations.js'
import WaterPumps from './WaterPumps.js'
import HydravlicTool from './HydravlicTool.js'
import SwimTools from './SwimTools.js'
import FoamAgent from './FoamAgent.js'
import Powder from './Powder.js'
import ExtenguisDocumentLink from './extenguisDocumentLink.js'
import UsageLiquidsLog from './usageLiquidsLog.js'
import backPackExtenguisher from './backPackExtenguisher.js'
import EquipmentArchive from './EquipmentArchive.js'
import TransferLog from './TransferLog.js'
import VehicleType from './VehicleType.js'
import EquipmentItem from './EquipmentItem.js'
import EquipmentAvailability from './EquipmentAvailability.js'
import BrigadeVehicle from './BrigadeVehicle.js'
import SpecialTool from './SpecialTool.js'
import FireEvent from './FireEvent.js'
import EventTeam from './EventTeam.js'
import EventHistory from './EventHistory.js'

// ── Associations ───────────────────────────────
// One Detachment has many Brigades
Detachment.hasMany(Brigade, { foreignKey: 'detachmentId', onDelete: 'CASCADE' })
Brigade.belongsTo(Detachment, { foreignKey: 'detachmentId' })

// One Brigade has many Users
Brigade.hasMany(User, { foreignKey: 'brigadeId' })
User.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many TestItems
Brigade.hasMany(TestItem, { foreignKey: 'brigadeId' })
TestItem.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One TestList has many TestItems
testList.hasMany(TestItem, { foreignKey: 'testListId', onDelete: 'CASCADE' })
TestItem.belongsTo(testList, { foreignKey: 'testListId' })

// One Brigade has one TestLinks
Brigade.hasOne(TestLinks, { foreignKey: 'brigadeId' })
TestLinks.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many ToolItems
Brigade.hasMany(ToolItem, { foreignKey: 'brigadeId' })
ToolItem.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One toolList has many ToolItems
toolList.hasMany(ToolItem, { foreignKey: 'toolListId', onDelete: 'CASCADE' })
ToolItem.belongsTo(toolList, { foreignKey: 'toolListId' })

// One Brigade has many ElectricStations
Brigade.hasMany(ElectricStations, { foreignKey: 'brigadeId' })
ElectricStations.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many WaterPumps
Brigade.hasMany(WaterPumps, { foreignKey: 'brigadeId' })
WaterPumps.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many HydravlicTool
Brigade.hasMany(HydravlicTool, { foreignKey: 'brigadeId' })
HydravlicTool.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many SwimTools
Brigade.hasMany(SwimTools, { foreignKey: 'brigadeId' })
SwimTools.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many FoamAgents
Brigade.hasMany(FoamAgent, { foreignKey: 'brigadeId' })
FoamAgent.belongsTo(Brigade, { foreignKey: 'brigadeId' })

//One brigade has many Powder
Brigade.hasMany(Powder, { foreignKey: 'brigadeId' })
Powder.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many ExtenguisDocumentLinks
Brigade.hasMany(ExtenguisDocumentLink, { foreignKey: 'brigadeId' })
ExtenguisDocumentLink.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many UsageLiquidsLogs
Brigade.hasMany(UsageLiquidsLog, { foreignKey: 'brigadeId' })
UsageLiquidsLog.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many backPackExtenguishers
Brigade.hasMany(backPackExtenguisher, { foreignKey: 'brigadeId' })
backPackExtenguisher.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many SpecialTools
Brigade.hasMany(SpecialTool, { foreignKey: 'brigadeId' })
SpecialTool.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// One Brigade has many EquipmentArchives
Brigade.hasMany(EquipmentArchive, { foreignKey: 'brigadeId' })
EquipmentArchive.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// TransferLog associations
Brigade.hasMany(TransferLog, { foreignKey: 'fromBrigadeId', as: 'OutgoingTransfers' })
Brigade.hasMany(TransferLog, { foreignKey: 'toBrigadeId', as: 'IncomingTransfers' })
TransferLog.belongsTo(Brigade, { foreignKey: 'fromBrigadeId', as: 'FromBrigade' })
TransferLog.belongsTo(Brigade, { foreignKey: 'toBrigadeId', as: 'ToBrigade' })

// Brigade <-> BrigadeVehicle
Brigade.hasMany(BrigadeVehicle, { foreignKey: 'brigadeId', onDelete: 'CASCADE' })
BrigadeVehicle.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// VehicleType <-> BrigadeVehicle
VehicleType.hasMany(BrigadeVehicle, { foreignKey: 'vehicleTypeId', onDelete: 'CASCADE' })
BrigadeVehicle.belongsTo(VehicleType, { foreignKey: 'vehicleTypeId' })

// VehicleType <-> EquipmentItem
VehicleType.hasMany(EquipmentItem, { foreignKey: 'vehicleTypeId', onDelete: 'CASCADE' })
EquipmentItem.belongsTo(VehicleType, { foreignKey: 'vehicleTypeId' })

// EquipmentItem <-> EquipmentAvailability
EquipmentItem.hasMany(EquipmentAvailability, { foreignKey: 'equipmentItemId', onDelete: 'CASCADE' })
EquipmentAvailability.belongsTo(EquipmentItem, { foreignKey: 'equipmentItemId' })

// Brigade <-> EquipmentAvailability
Brigade.hasMany(EquipmentAvailability, { foreignKey: 'brigadeId' })
EquipmentAvailability.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// FireEvent <-> EventTeam
FireEvent.hasMany(EventTeam, { foreignKey: 'fireEventId', onDelete: 'CASCADE' })
EventTeam.belongsTo(FireEvent, { foreignKey: 'fireEventId' })

// FireEvent <-> EventHistory
FireEvent.hasMany(EventHistory, { foreignKey: 'fireEventId', onDelete: 'CASCADE' })
EventHistory.belongsTo(FireEvent, { foreignKey: 'fireEventId' })

// EventTeam <-> Brigade (association, no cascade — brigades shouldn't be deleted anyway)
Brigade.hasMany(EventTeam, { foreignKey: 'brigadeId' })
EventTeam.belongsTo(Brigade, { foreignKey: 'brigadeId' })

// EventTeam <-> User (senior user)
User.hasMany(EventTeam, { foreignKey: 'seniorUserId' })
EventTeam.belongsTo(User, { foreignKey: 'seniorUserId', as: 'SeniorUser' })

// FireEvent <-> User (creator)
User.hasMany(FireEvent, { foreignKey: 'createdByUserId' })
FireEvent.belongsTo(User, { foreignKey: 'createdByUserId', as: 'Creator' })

export { User, Detachment, Brigade, testList, TestItem, TestLinks, toolList, ToolItem, ElectricStations, WaterPumps, HydravlicTool, SwimTools, FoamAgent, Powder, ExtenguisDocumentLink, UsageLiquidsLog, backPackExtenguisher, EquipmentArchive, TransferLog, VehicleType, EquipmentItem, EquipmentAvailability, BrigadeVehicle, SpecialTool, FireEvent, EventTeam, EventHistory }

