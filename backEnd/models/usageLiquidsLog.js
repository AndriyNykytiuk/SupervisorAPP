import { DataTypes } from "sequelize"
import sequelize from "../config/db.js"

const UsageLiquidsLog = sequelize.define("UsageLiquidsLog", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    volume: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    substance: {
        type: DataTypes.STRING,
        allowNull: false,   //foam or powder 
    },

    eventType: {
        type: DataTypes.STRING,  // few events in droplist
        allowNull: false,
    },

    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

})

export default UsageLiquidsLog
