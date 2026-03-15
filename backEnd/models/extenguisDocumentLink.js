import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const ExtenguisDocumentLink = sequelize.define('ExtenguisDocumentLink', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    documentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documentLink: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
})

export default ExtenguisDocumentLink