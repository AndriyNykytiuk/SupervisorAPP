import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const BrigadeVehicle = sequelize.define('BrigadeVehicle', {
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
});

export default BrigadeVehicle
