import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const EquipmentItem = sequelize.define('EquipmentItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Одиниці виміру для опису автомобіля («шт.», «компл.», «м», «пара»).
    unit: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'шт.',
    },
    // Норма з наказу як текст, коли вона не числова: «Відповідно до ТУ»,
    // «1х100», «По 1-му на кожну одиницю…». Для друку опису й показу в UI.
    // У розрахунках бере участь required_per_vehicle.
    required_text: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    required_per_vehicle: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    required_rule: {
        type: DataTypes.STRING,
        defaultValue: 'exact',
    },
    warehouse_required: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    warehouse_rule: {
        type: DataTypes.STRING,
        defaultValue: 'exact',
    },
    warehouse_percent: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        
    },
    vehicleTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'VehicleTypes',
            key: 'id',
        },
    },
})

export default EquipmentItem
