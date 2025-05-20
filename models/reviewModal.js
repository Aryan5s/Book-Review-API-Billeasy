const { sequelize, DataTypes } = require('../config/dbConnect');
const User = require('./userModel'); 
const Book = require('./bookModel');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  bookId: {
    type: DataTypes.INTEGER,
    references: {
      model: Book,
      key: 'id'
    },
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    // Create a unique index on userId and bookId to ensure one review per user per book
    {
      unique: true,
      fields: ['userId', 'bookId']
    }
  ]
});

// Set up associations
Review.belongsTo(User);
Review.belongsTo(Book);
Book.hasMany(Review);

module.exports = Review;