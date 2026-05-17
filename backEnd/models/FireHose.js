import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const FireHose = sequelize.define('FireHose', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    inventoryNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pressure',
    },
    length: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    diameter: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    manufactureDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastTestDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    nextTestDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    result: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pass',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    linkName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Brigades', key: 'id' },
    },
}, {
    tableName: 'FireHoses',
    timestamps: true,
})

export default FireHose
