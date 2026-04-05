import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const EquipmentAvailability = sequelize.define('EquipmentAvailability', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    equipmentItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'EquipmentItems',
            key: 'id',
        },
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Brigades',
            key: 'id',
        },
    },
    vehicleCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    available: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    reserveAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
})

export default EquipmentAvailability
