import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const FireHydrantInspection = sequelize.define('FireHydrantInspection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    fireHydrantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'FireHydrants', key: 'id' },
        onDelete: 'CASCADE',
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Brigades', key: 'id' },
    },
    inspectionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    inspectorName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    inspectorUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'working',
    },
    pressure: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    defects: {
        type: DataTypes.TEXT,
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
}, {
    tableName: 'FireHydrantInspections',
    timestamps: true,
})

export default FireHydrantInspection
