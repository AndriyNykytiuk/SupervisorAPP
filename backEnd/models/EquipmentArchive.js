import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const EquipmentArchive = sequelize.define('EquipmentArchive', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    originalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    equipmentType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    inventoryNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    manufactureYear: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastTestDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    writeOffDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    writeOffReason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    writeOffExplanation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    actNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    documentLink: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    responsibleUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    historicalData: {
        type: DataTypes.JSON,
        allowNull: true,
    }
})

export default EquipmentArchive
