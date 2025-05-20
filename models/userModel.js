const { sequelize, DataTypes } = require('../config/dbConnect');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true // unique email address for each user
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
});

module.exports = User;