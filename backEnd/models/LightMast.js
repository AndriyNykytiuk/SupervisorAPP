import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const LightMast = sequelize.define('LightMast', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    yearOfPurchase: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    power: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    placeOfStorage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    extensionCordsCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Brigades', key: 'id' },
    },
}, {
    tableName: 'LightMasts',
    timestamps: true,
});

export default LightMast;
