import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const EquipmentItem = sequelize.define('EquipmentItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    norm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    brigadeNorm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    vehicleTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'VehicleTypes',
            key: 'id',
        },
    },
})

export default EquipmentItem
