import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const TransferLog = sequelize.define('TransferLog', {
    itemName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    equipmentType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'TestItem, ToolItem, ElectricStations, HydravlicTool, SwimTools',
    },
    fromBrigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    toBrigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'For SwimTools this may be > 1',
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Snapshot of transferred item data',
    },
    transferDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
})

export default TransferLog
