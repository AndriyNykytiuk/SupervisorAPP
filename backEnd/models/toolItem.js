import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const ToolItem = sequelize.define('ToolItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    yearOfPurchase: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    powerfull: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    storagePlace: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    toolListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default ToolItem