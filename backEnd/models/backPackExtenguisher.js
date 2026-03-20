import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const backPackExtenguisher = sequelize.define('backPackExtenguisher', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    volumeOfWater: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    typeStern: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    placeOfStorage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    toolListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    brigadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default backPackExtenguisher