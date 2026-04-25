import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const FireExtenguisher = sequelize.define('FireExtenguisher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    inventoryNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    extinguisherType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nextMaintenanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    inspectionConclusion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    measuresTaken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sentToMaintenanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    returnedFromMaintenanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    maintenanceOrganization: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    decommissionYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Brigades', key: 'id' },
    },
}, {
    tableName: 'FireExtenguishers',
    timestamps: true,
});

export default FireExtenguisher;
