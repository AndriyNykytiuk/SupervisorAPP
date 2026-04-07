import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const VehicleType = sequelize.define('VehicleType', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    viechle_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Brigades',
            key: 'id',
        },
    },
    
})

export default VehicleType
