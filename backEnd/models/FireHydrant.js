import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const FireHydrant = sequelize.define('FireHydrant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    inventoryNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastInspectionDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    nextInspectionDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'working',
    },
    pressure: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    diameter: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    inspectorName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    waterClean: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    noWaterHammer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    indicatorsPresent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    conesPresent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    groundingOk: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Brigades', key: 'id' },
    },
}, {
    tableName: 'FireHydrants',
    timestamps: true,
})

export default FireHydrant
