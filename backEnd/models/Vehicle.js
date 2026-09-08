import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

// Картка конкретного автомобіля частини (не тип, а саме одиниця техніки).
const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stateNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    yearOfManufacture: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'combat',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    vehicleTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'VehicleTypes', key: 'id' },
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Brigades', key: 'id' },
    },
}, {
    tableName: 'Vehicles',
    timestamps: true,
})

export default Vehicle
