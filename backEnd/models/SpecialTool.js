import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SpecialTool = sequelize.define('SpecialTool', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },  
    placeOfStorage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'SpecialTools',
    timestamps: true
});

export default SpecialTool;