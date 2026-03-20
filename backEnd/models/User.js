import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('RO', 'RW', 'GOD', 'SEMI-GOD'),
        allowNull: false,
        defaultValue: 'RW',
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: true, // nullable — GOD users may not belong to a brigade
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
})

export default User
