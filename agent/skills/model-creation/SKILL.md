# Model Creation Skill

## Stack
Sequelize + MySQL (dialect: mysql)

## Template
import { DataTypes } from 'sequelize'
import { sequelize } from './index.js'

export const ModelName = sequelize.define('ModelName', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Brigades', key: 'id' },
        onDelete: 'SET NULL',
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'model_name',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
})

## Associations (завжди в models/index.js)
Brigade.hasMany(ModelName, { foreignKey: 'brigadeId', as: 'items' })
ModelName.belongsTo(Brigade, { foreignKey: 'brigadeId', as: 'brigade' })

## Sync (в server.js)
await ModelName.sync({ alter: true })