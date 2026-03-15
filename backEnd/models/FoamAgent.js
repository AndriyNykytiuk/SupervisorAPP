import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const FoamAgent = sequelize.define('FoamAgent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    vehiclePassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    vehicleNotPassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    wherehousePassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    wherehouseNotPassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    cannisteroVolume: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    barrelVolume: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ibcVolume : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Brigades',
            key: 'id',
        },
    },
})

export default FoamAgent