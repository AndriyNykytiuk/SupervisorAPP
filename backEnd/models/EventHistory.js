import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const EventHistory = sequelize.define('EventHistory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fireEventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    action: {
        type: DataTypes.ENUM(
            'event_created',
            'event_closed',
            'event_updated',
            'team_added',
            'team_removed',
            'team_count_changed',
            'team_updated'
        ),
        allowNull: false,
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
})

export default EventHistory
