const { sequelize, DataTypes } = require('../config/dbConnect');

const Book = sequelize.define('book', {
    id : {
     type : DataTypes.INTEGER,
    autoIncrement : true,
    allowNull : false,
    primaryKey : true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING,
    },
    publication_year: {
      type: DataTypes.INTEGER,
    },
    ISBN: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

module.exports = Book;