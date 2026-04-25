import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PetrolCutter = sequelize.define('PetrolCutter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    yearOfPurchase: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    placeOfStorage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Brigades', key: 'id' },
    },
}, {
    tableName: 'PetrolCutters',
    timestamps: true,
});

export default PetrolCutter;
