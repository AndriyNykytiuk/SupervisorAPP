import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

// Рядок опису ПТО та АРО, що знаходиться на конкретному автомобілі.
// Структура колонок — за зразком опису (наказ): найменування, одиниці виміру,
// необхідно згідно наказу, знаходиться на автомобілі. Некомплект обчислюється.
const VehicleInventoryItem = sequelize.define('VehicleInventoryItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'шт.',
    },
    // Рядок, а не число: у наказі трапляється «Відповідно до ТУ», «1х100»,
    // «По 1-му на кожну одиницю вказаного обладнання», «3****», «-».
    requiredText: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    actualQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Vehicles', key: 'id' },
    },
    // Прив'язка до нормативу типу авто. Саме по ній зводиться потреба ПТО —
    // не по тексту назви. NULL лише у позицій, доданих вручну поза нормативом.
    equipmentItemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'EquipmentItems', key: 'id' },
    },
}, {
    tableName: 'VehicleInventoryItems',
    timestamps: true,
})

export default VehicleInventoryItem
