import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Powder = sequelize.define("Powder", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    vehiclePowderPassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    vehiclePowderNotPassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    werhousePowderPassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    werhousePowderNotPassed: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Brigades',
            key: 'id',
        },
    },
})

export default Powder
