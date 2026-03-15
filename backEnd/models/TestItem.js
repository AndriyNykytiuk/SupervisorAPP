import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const TestItem = sequelize.define('TestItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    inventoryNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    testDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    result: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nextTestDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    linkName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    testListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default TestItem
