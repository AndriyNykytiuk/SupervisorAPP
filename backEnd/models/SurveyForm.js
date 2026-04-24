import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const SurveyForm = sequelize.define('SurveyForm', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Array of question objects. Each question:
    //   { id, order, label, type, required, config }
    // type ∈ 'number' | 'presence' | 'state' | 'text' | 'photo'
    // config shape depends on type:
    //   number   → { unit?: string }
    //   state    → { options: string[] }
    //   photo    → { maxFiles?: number }
    //   presence → {}
    //   text     → { multiline?: boolean }
    questions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open',
    },
    createdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdByUserName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
})

export default SurveyForm
