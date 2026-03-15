import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TestLinks = sequelize.define('TestLinks', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    linkSchedule: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    linkOrder: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default TestLinks