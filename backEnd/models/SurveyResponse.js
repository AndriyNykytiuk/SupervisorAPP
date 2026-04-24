import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const SurveyResponse = sequelize.define(
    'SurveyResponse',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        surveyFormId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        brigadeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Snapshot of the brigade name at submission time, so the response
        // stays readable even if the brigade is later renamed/deleted.
        brigadeName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        submittedByUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        submittedByUserName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Map keyed by question.id. Value shape depends on the question type:
        //   number   → { number: <n> }
        //   presence → { presence: <bool> }
        //   state    → { state: <option string> }
        //   text     → { text: <string> }
        //   photo    → { photos: [<url>, ...] }
        answers: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['surveyFormId', 'brigadeId'],
                name: 'survey_response_form_brigade_unique',
            },
        ],
    }
)

export default SurveyResponse
