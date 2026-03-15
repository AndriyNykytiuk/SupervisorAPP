import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'


const ElectricStations = sequelize.define('ElectricStations', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    yaerOfPurchase: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    powerOf: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    placeOfStorage: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
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

export default ElectricStations