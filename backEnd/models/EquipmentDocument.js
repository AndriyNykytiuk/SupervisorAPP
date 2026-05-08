import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const EquipmentDocument = sequelize.define('EquipmentDocument', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    equipmentType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    equipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    documentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    originalFilename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    storedFilename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    uploadedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    uploadedByUserName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'EquipmentDocuments',
    timestamps: true,
    indexes: [
        { fields: ['equipmentType', 'equipmentId'] },
        { fields: ['brigadeId'] },
    ],
})

export default EquipmentDocument
