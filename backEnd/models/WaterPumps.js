import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const WaterPumps = sequelize.define('WaterPumps', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    yearOfPurchase: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    powerOf: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Brigades',
            key: 'id'
        }
    },
    placeOfStorage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

export default WaterPumps