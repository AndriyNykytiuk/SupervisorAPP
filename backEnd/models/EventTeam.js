import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const EventTeam = sequelize.define('EventTeam', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fireEventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    locationName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    seniorUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    seniorNameText: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    peopleCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    vehicles: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fuel: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    equipment: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
    },
})

export default EventTeam
