import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const Brigade = sequelize.define('Brigade', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // detachmentId is added automatically by the association
})

export default Brigade
