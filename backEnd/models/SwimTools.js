import { DataTypes, INTEGER } from 'sequelize'
import sequelize from '../config/db.js'

const SwimTools = sequelize.define('SwimTools', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    lifeBoat: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    motorLifeBoat: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    lifeBouy: {
        type: DataTypes.INTEGER,
        allowNull: true,

    },
    lifeRoup: {
        type: DataTypes.INTEGER,
        allowNull: true,

    },
    lifePath: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    rescueSlad: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    lifeJacket: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    drySuits: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Brigades',
            key: 'id'
        }
    }
})

export default SwimTools
